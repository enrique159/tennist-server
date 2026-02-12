import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CourtPricingService, PriceCalculation } from '../services/court-pricing.service';
import { CreateCourtPricingRuleDto } from '../dto/create-court-pricing-rule.dto';
import { UpdateCourtPricingRuleDto } from '../dto/update-court-pricing-rule.dto';
import { CalculatePriceDto } from '../dto/calculate-price.dto';
import { CourtPricingRule } from '../entities/court-pricing-rule.entity';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('courts')
@UseGuards(AuthGuard)
export class CourtPricingController {
  constructor(private readonly courtPricingService: CourtPricingService) {}

  @Post(':courtId/pricing-rules')
  async createPricingRule(
    @Param('courtId') courtId: string,
    @Body() createPricingRuleDto: CreateCourtPricingRuleDto,
    @Request() req,
  ): Promise<CourtPricingRule> {
    return this.courtPricingService.create(courtId, createPricingRuleDto, req.user);
  }

  @Get(':courtId/pricing-rules')
  async getPricingRules(@Param('courtId') courtId: string): Promise<CourtPricingRule[]> {
    return this.courtPricingService.findByCourtId(courtId);
  }

  @Put('pricing-rules/:ruleId')
  async updatePricingRule(
    @Param('ruleId') ruleId: string,
    @Body() updatePricingRuleDto: UpdateCourtPricingRuleDto,
    @Request() req,
  ): Promise<CourtPricingRule> {
    return this.courtPricingService.update(ruleId, updatePricingRuleDto, req.user);
  }

  @Delete('pricing-rules/:ruleId')
  async deletePricingRule(@Param('ruleId') ruleId: string, @Request() req): Promise<void> {
    return this.courtPricingService.delete(ruleId, req.user);
  }

  @Post(':courtId/calculate-price')
  async calculatePrice(
    @Param('courtId') courtId: string,
    @Body() calculatePriceDto: CalculatePriceDto,
  ): Promise<PriceCalculation> {
    return this.courtPricingService.calculatePrice(
      courtId,
      calculatePriceDto.durationMinutes,
      calculatePriceDto.playersCount,
    );
  }
}
