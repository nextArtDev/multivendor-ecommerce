# Next internationalization

## Server 

```ts
  const t = await getTranslations('HomePage')

  <h1>{t('title')}</h1>
```

## client

```ts
const t = useTranslations('Theme')
// accessing locale 
  const locale = useLocale()

   <div dir={locale === 'en' ? 'ltr' : 'rtl'}>
    
    <h1>{t('Light')}</h1>

 </div>
```