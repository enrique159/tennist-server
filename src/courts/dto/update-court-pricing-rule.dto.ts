import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtPricingRuleDto } from './create-court-pricing-rule.dto';

export class UpdateCourtPricingRuleDto extends PartialType(CreateCourtPricingRuleDto) {}
