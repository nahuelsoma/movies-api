import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseRepository extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      // enhace this error handling
      console.log('error in DatabaseRepository.onModuleInit: ', error.message);
    }
  }
}
