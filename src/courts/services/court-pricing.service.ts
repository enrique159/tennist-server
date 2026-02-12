import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '../entities/court.entity';
import { CourtPricingRule, PricingType } from '../entities/court-pricing-rule.entity';
import { Venue } from '@/venues/venue.entity';
import { CreateCourtPricingRuleDto } from '../dto/create-court-pricing-rule.dto';
import { UpdateCourtPricingRuleDto } from '../dto/update-court-pricing-rule.dto';
import { Role } from '@/users/domain/user';

export interface PriceCalculation {
  totalPriceCents: number;
  appliedRule: CourtPricingRule;
}

@Injectable()
export class CourtPricingService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(CourtPricingRule)
    private pricingRuleRepository: Repository<CourtPricingRule>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  /**
   * @description Calcula el precio de reserva de una cancha
   * @param { string } courtId - ID de la cancha
   * @param { number } durationMinutes - Duración de la reserva en minutos
   * @param { number } playersCount - Cantidad de jugadores
   * @returns { Promise<PriceCalculation> } Precio total en centavos y regla aplicada
   */
  async calculatePrice(
    courtId: string,
    durationMinutes: number,
    playersCount: number,
  ): Promise<PriceCalculation> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    const rules = await this.pricingRuleRepository.find({
      where: { courtId },
    });

    if (rules.length === 0) {
      throw new NotFoundException(`No se encontraron reglas de precio para la cancha ${courtId}`);
    }

    const applicableRule = this.selectApplicableRule(rules, durationMinutes, playersCount);

    if (!applicableRule) {
      throw new BadRequestException(
        'Ninguna regla de precio coincide con la duración y cantidad de jugadores proporcionados',
      );
    }

    const totalPriceCents = this.computePrice(
      applicableRule,
      durationMinutes,
      playersCount,
    );

    return {
      totalPriceCents,
      appliedRule: applicableRule,
    };
  }

  /**
   * @description Selecciona la regla de precio aplicable según duración y cantidad de jugadores
   * @param { CourtPricingRule[] } rules - Lista de reglas de precio disponibles
   * @param { number } durationMinutes - Duración de la reserva en minutos
   * @param { number } playersCount - Cantidad de jugadores
   * @returns { CourtPricingRule | null } Regla aplicable o null si no hay coincidencia
   */
  private selectApplicableRule(
    rules: CourtPricingRule[],
    durationMinutes: number,
    playersCount: number,
  ): CourtPricingRule | null {
    for (const rule of rules) {
      if (durationMinutes < rule.minDurationMinutes) {
        continue;
      }

      if (rule.maxDurationMinutes && durationMinutes > rule.maxDurationMinutes) {
        continue;
      }

      if (rule.maxPlayers && playersCount > rule.maxPlayers) {
        continue;
      }

      return rule;
    }

    return null;
  }

  /**
   * @description Calcula el precio final según el tipo de regla (por hora o por persona)
   * @param { CourtPricingRule } rule - Regla de precio a aplicar
   * @param { number } durationMinutes - Duración de la reserva en minutos
   * @param { number } playersCount - Cantidad de jugadores
   * @returns { number } Precio total en centavos
   */
  private computePrice(
    rule: CourtPricingRule,
    durationMinutes: number,
    playersCount: number,
  ): number {
    if (rule.pricingType === PricingType.PER_HOUR) {
      const hours = durationMinutes / 60;
      return Math.ceil(rule.price * hours);
    }

    if (rule.pricingType === PricingType.PER_PERSON) {
      const hours = durationMinutes / 60;
      return Math.ceil(rule.price * playersCount * hours);
    }

    return rule.price;
  }

  /**
   * @description Crea una regla de precio para una cancha
   * @param { string } courtId - ID de la cancha
   * @param { CreateCourtPricingRuleDto } createPricingRuleDto - Datos de la regla de precio
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<CourtPricingRule> } Regla de precio creada
   */
  async create(
    courtId: string,
    createPricingRuleDto: CreateCourtPricingRuleDto,
    currentUser: any,
  ): Promise<CourtPricingRule> {
    const court = await this.courtRepository.findOne({
      where: { id: courtId },
      relations: ['venue'],
    });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    const venue = await this.venueRepository.findOne({
      where: { id: court.venueId },
    });

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para gestionar precios de esta cancha');
    }

    if (
      createPricingRuleDto.maxDurationMinutes &&
      createPricingRuleDto.minDurationMinutes > createPricingRuleDto.maxDurationMinutes
    ) {
      throw new BadRequestException(
        'La duración mínima no puede ser mayor que la duración máxima',
      );
    }

    const pricingRule = this.pricingRuleRepository.create({
      ...createPricingRuleDto,
      courtId,
    });

    return await this.pricingRuleRepository.save(pricingRule);
  }

  /**
   * @description Obtiene todas las reglas de precio de una cancha
   * @param { string } courtId - ID de la cancha
   * @returns { Promise<CourtPricingRule[]> } Lista de reglas de precio
   */
  async findByCourtId(courtId: string): Promise<CourtPricingRule[]> {
    const court = await this.courtRepository.findOne({ where: { id: courtId } });

    if (!court) {
      throw new NotFoundException(`Cancha con ID ${courtId} no encontrada`);
    }

    return await this.pricingRuleRepository.find({
      where: { courtId },
    });
  }

  /**
   * @description Actualiza una regla de precio existente
   * @param { string } ruleId - ID de la regla de precio
   * @param { UpdateCourtPricingRuleDto } updatePricingRuleDto - Datos a actualizar
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<CourtPricingRule> } Regla de precio actualizada
   */
  async update(
    ruleId: string,
    updatePricingRuleDto: UpdateCourtPricingRuleDto,
    currentUser: any,
  ): Promise<CourtPricingRule> {
    const rule = await this.pricingRuleRepository.findOne({
      where: { id: ruleId },
      relations: ['court', 'court.venue'],
    });

    if (!rule) {
      throw new NotFoundException(`Regla de precio con ID ${ruleId} no encontrada`);
    }

    const venue = rule.court.venue;

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para modificar esta regla de precio');
    }

    const minDuration = updatePricingRuleDto.minDurationMinutes ?? rule.minDurationMinutes;
    const maxDuration = updatePricingRuleDto.maxDurationMinutes ?? rule.maxDurationMinutes;

    if (maxDuration && minDuration > maxDuration) {
      throw new BadRequestException(
        'La duración mínima no puede ser mayor que la duración máxima',
      );
    }

    Object.assign(rule, updatePricingRuleDto);

    return await this.pricingRuleRepository.save(rule);
  }

  /**
   * @description Elimina una regla de precio
   * @param { string } ruleId - ID de la regla de precio
   * @param { any } currentUser - Usuario actual que realiza la acción
   * @returns { Promise<void> }
   */
  async delete(ruleId: string, currentUser: any): Promise<void> {
    const rule = await this.pricingRuleRepository.findOne({
      where: { id: ruleId },
      relations: ['court', 'court.venue'],
    });

    if (!rule) {
      throw new NotFoundException(`Regla de precio con ID ${ruleId} no encontrada`);
    }

    const venue = rule.court.venue;

    if (currentUser.role !== Role.ADMIN && venue.ownerUserId !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta regla de precio');
    }

    await this.pricingRuleRepository.remove(rule);
  }
}
