import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from '../entities/court.entity';
import { CourtPricingRule, PricingType } from '../entities/court-pricing-rule.entity';

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
}
