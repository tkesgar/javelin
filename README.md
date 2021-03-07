# javelin

[![ジャベリンかわいい](https://cdn.donmai.us/original/a5/35/__javelin_azur_lane_drawn_by_moupii_hitsuji_no_ki__a535453fe8057a3bb34797589317856f.png)](https://www.pixiv.net/en/artworks/73661871)

> I've gotten closer to you now, Commander. Hehehe. But I'm gonna have to work
> harder~

javelin is an app where people can arrange notes in a number of columns. It is
built with [Next.js][next] and uses [Firebase][firebase] to store data.

A public instance is available here: https://javelin.vercel.app.

## Usage

### Requirements

- Node.js 14
- A Firebase project to use (free tier is enough)

### Installation

Clone this repository, then install the dependencies:

```bash
git clone https://github.com/tkesgar/javelin
cd javelin
npm install
```

Get the Firebase project configuration and add it in `.env` as
`NEXT_PUBLIC_FIREBASE_CONFIG`. Otherwise it will uses the public javelin
Firebase instance.

```
NEXT_PUBLIC_FIREBASE_CONFIG="{
  "apiKey":"firebase-api-key","authDomain": "firebase-auth-domain.firebaseapp.com",
  "databaseURL": "https://firebase-database-url.firebaseio.com",
  "projectId": "firebase-project-id",
  "storageBucket": "firebase-storage-bucket.appspot.com",
  "messagingSenderId": "firebase-messaging-sender-id",
  "appId": "firebase-app-id"
}"
```

### Development

```bash
npm run dev
```

### Deployment

```
npm run build
npm start
```

## Contributing

Feel free to submit [issues] and create [pull requests][pulls].

## License

Licensed under MIT License.

<!-- prettier-ignore-start -->
[firebase]: https://firebase.google.com/
[issues]: https://github.com/tkesgar/javelin/issues
[pulls]: https://github.com/tkesgar/javelin/pulls
<!-- prettier-ignore-end -->
