import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DomainModule } from './domain/domain.module';

const uri = 'mongodb+srv://prod:ProdMongoPassword@cluster0-en0rc.mongodb.net/test?retryWrites=true';

@Module({
  imports: [
    MongooseModule.forRoot(uri, {useNewUrlParser: true}),
    DomainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
