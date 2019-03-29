import { Controller, Get } from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('domain')
export class DomainController {
    constructor(private readonly domainService: DomainService) {
    }

    @Get('/api/v1/scan')
    async scanNetKg() {
        const domains = await this.domainService.getDomainsFromNetKg();
        return domains;
    }

    @Get('/api/v1/find')
    async findAllWebsites() {
        const domains = await this.domainService.findAll();
        return domains;
    }
}
