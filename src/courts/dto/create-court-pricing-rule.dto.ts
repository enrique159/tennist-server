import { IsNotEmpty, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { PricingType } from '../entities/court-pricing-rule.entity';

export class CreateCourtPricingRuleDto {
  @IsEnum(PricingType)
  @IsNotEmpty()
  pricingType: PricingType;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxPlayers?: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  minDurationMinutes: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxDurationMinutes?: number;
}
