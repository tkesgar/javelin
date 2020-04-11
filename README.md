# javelin

[![Netlify Status](https://api.netlify.com/api/v1/badges/1c6baa2e-ef81-49df-8bd8-4af30a46d439/deploy-status)](https://app.netlify.com/sites/javelin-a87b9e98/deploys)

javelin is a web app where people can arrange notes in a number of columns. I
built this primarily to help with sprint retrospective in my office, but it may
be useful for other activities as well.

javelin is built with [Next.js][nextjs] and uses [Firebase][firebase] to store
data. It can be deployed in serverless environments (e.g. Netlify).

A public instance is available here: https://javelin.tkesgar.com

## Usage

### Requirements

- [Node.js][nodejs] (javelin is developed under Node.js 12)
- [npm][npm]
- A Firebase project to use (free tier is enough)

### Installation

Clone this repository, then install the dependencies:

```bash
git clone https://github.com/tkesgar/javelin
cd javelin
npm install
```

Add a `firebase.config.json` containing the Firebase configuration. It can be
obtained from the project settings page.

```json
{
  "apiKey": "firebase-api-key",
  "authDomain": "firebase-auth-domain.firebaseapp.com",
  "databaseURL": "https://firebase-database-url.firebaseio.com",
  "projectId": "firebase-project-id",
  "storageBucket": "firebase-storage-bucket.appspot.com",
  "messagingSenderId": "firebase-messaging-sender-id",
  "appId": "firebase-app-id"
}
```

> Alternatively, put the JSON string as environment variables. This is intended
> for environments such as Netlify, where it is more convenient to provide an
> environment variable.

### Development

Start Next.js development server:

```bash
npm run dev
```

Run Jest tests:

```bash
npm test                # Run tests
npm test -- --watch     # Run only changed tests
npm test -- --coverage  # Run test with code coverage
```

Start Cypress testing server:

```bash
npm run cypress -- start  # Run interactive GUI
npm run cypress -- run    # Run Cypress tests
```

### Deployment

Build and export the page files:

```
npm run build
npm run export
```

The compiled files is available in `out` directory, which should be served using
a HTTP server.

## Contributing

Feel free to submit [issues] and create [pull requests][pulls].

## License

Licensed under [MIT License][license].

<!-- prettier-ignore-start -->
[firebase]: https://firebase.google.com/
[issues]: https://github.com/tkesgar/javelin/issues
[license]: https://github.com/tkesgar/javelin/blob/master/LICENSE
[nextjs]: https://nextjs.org/docs/getting-started
[nodejs]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pulls]: https://github.com/tkesgar/javelin/pulls
<!-- prettier-ignore-end -->
