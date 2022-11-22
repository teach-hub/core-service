# TeachHub Core Service

Backend principal de la aplicación. Utiliza TS (Typescript) como lenguaje, `sqitch` como gestor de migraciones/cambios de esquema.

## Local development

Dependencias necesarias:

 - PostgreSQL
 - sqitch
 - node
 - npm

Una vez tengamos todo, instalar con `npm install`. Para buildear la aplicación usamos `npx tsc` y corremos con `node dist/index.js`

## Crear una migración

Para crear una migración nos paramos en la carpeta `db` en `src`. Una vez allí corremos `sqitch add <nombre migración> -n <mensaje>`, esto lo que hará es crear tres archivos, uno en cada una de las siguientes carpetas: `deploy`, `revert` y `verify`. Completamos con la migración necesaria en cada uno teniendo en cuenta lo siguiente

 - `verify`: cambio que se correrá para verificar que nuestro cambio efectivamente fue aplicado
 - `revert`: cambio que se correrá para revertir nuestra migración
 - `deploy`: cambio principal que contiene la migración que queremos realizar sobre la base de datos.

## Instalar hooks pre-commit


Los hooks pre-commit deberian instalarse solos junto con la instalacion de dependencias. Si no es asi siempres se puede correr `npm run prepare`.

