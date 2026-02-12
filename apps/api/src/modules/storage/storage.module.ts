import { Module, Global } from '@nestjs/common';

import { FILE_STORAGE_PORT } from './domain/ports/file-storage.port';
import { R2StorageAdapter } from './infrastructure/adapters/r2-storage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: FILE_STORAGE_PORT,
      useClass: R2StorageAdapter,
    },
  ],
  exports: [FILE_STORAGE_PORT],
})
export class StorageModule {}
