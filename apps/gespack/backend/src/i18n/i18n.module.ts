import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AcceptLanguageResolver } from 'nestjs-i18n';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(process.cwd(), 'locales'),
        watch: true,
      },
      typesOutputPath: path.join(process.cwd(), 'src/generated/i18n.generated.ts'),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] }, // permite ?lang=en
            new AcceptLanguageResolver(),
      ],
    }),
  ],
})
export class AppI18nModule {}