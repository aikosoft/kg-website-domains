import { Module } from '@nestjs/common';
import { DomainService } from './domain/domain.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainSchema } from '../schemas/domain.schema';
import { DomainController } from './domain/domain.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Domain', schema: DomainSchema }])],
    providers: [DomainService],
    controllers: [DomainController],
})
export class DomainModule {
}
