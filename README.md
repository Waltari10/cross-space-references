# Cross-Space Reference UI Extension

> This is for the moment internal only, we're refining it to make it public.

## Installation

```
npm install && npm run configure
```

This will install all dependencies, setup the Contentful CLI with your desired target space and target environment, and run a migration setting up the necessary configuration Content Type.

## Configuring your space

Once the dependencies are installed and migrations ran, you need to install the extension in your space.

This will happen when you start running this package in development mode:

```
npm run start
```

Then create a new JSON field in any Content Type in your space, and select the `cross-space-reference` appearance.

## LICENSE

MIT
