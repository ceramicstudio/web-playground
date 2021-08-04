# Ceramic Playground
This can be used as a companion to the Video Guide or if you just want to go through it on your own. 
## Setup
1. Open the [Web Playground](https://playground.ceramic.network){:target="_blank"}
2. Open your Browser's devtools and navigate to the "console" tab. 
   1. This is usually as simple as hitting your `F12` key or `CMD+OPT+I`.
3. Click on the "Connect Wallet" Button, if you don't have a wallet MetaMask is a good place to start.
4. Follow the prompts that are in the upper right hand corner to authenticate with 3ID-Connect. 
   - After you authenticate open your web browser tools, you should see something like `Connected with DID: did:3:kjz...r5y` in the upper right hand corner, alternatively your full DID will be briefly displayed in an alert.

## Basic Ceramic Usage:

### Tile Creation & Querys
We'll start by creating an example record on the Ceramic Network.
```JavaScript
const tile = await TileDocument.create(ceramic, {hello: 'world'})
```
You've just created your first record on the Ceramic Network, it's that easy. Loading a record is similar,
```JavaScript
const loadedTile = await TileDocument.load(ceramic, tile.id.toString())
```
That's all it takes. To explain a little more on what happens, we pass in the authenticated instance of Ceramic (we've done this part for you but if you want more information please check out [our Authentication flow](https://developers.ceramic.network/authentication/3id-did/method/){:target="_blank"}, we used 3ID-Connect in step 3), the next parameter for Creation is what we want the record's body to look like. For loading we just need to provide an authenticated instance & the ID we want to find. Here we've just passed in the `tile` we created beforehand, but if you have a string you want to use instead you just need to add that instead.

### Schema Creation
**WARNING: Schemas should not be created at runtime and should be created beforehand in a 'bootstrap' file.**
In the Ceramic Network Schemas are stored as tiles, but they have more uses than just storing information. If you want to [take a look](https://developers.ceramic.network/tools/idx/overview/#schemas){:target="_blank"} our documentation will provide much more detail.

The following is a sample Blog Schema with some added definition in the comments.

```JavaScript
const bookSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#', // required.
  title: 'Book', // required
  type: 'object', // required
  properties: {
    publishedDate: {
      type: 'string',
      format: 'date-time',
      title: 'date',
      maxLength: 30,
    }, // any further properties are optional. You must have one property in the schema
    title: {
      type: 'string',
      title: 'title',
      maxLength: 50
    },
    contents: {
      type: 'string',
      title: 'text',
      maxLength: 4000
    }
  }
}
```

Now that we've defined the schema we can create it. Creating a Schema is exactly like creating a Tile.

```JavaScript
const schema = await TileDocument.create(ceramic, blogSchema)
```

```JavaScript
const ceramicBlogPost = await TileDocument.create(
    ceramic,
    { // We defined this in the blogSchema above
        date: new Date().toISOString(),
        title: 'Hello Ceramic network!',
        text: 'My First Post.'
    }, {
        controllers: [ceramic.did.id], // This should be your DID, or the DID of whoever will control the Stream
        family: 'books', // A tag on the tile to help group Schemas & Posts together
        schema: schema.commitId.toString() // The commit ID of the schema we created earlier. This will validate that only what we expect is in the tile.
    }
)
```

And that's all you need to do to create your first book. Similar to creating a Tile you can load one quite easily.

```JavaScript
const loadedBlogPost = await TileDocument.load(
    ceramic,
    ceramicBlogPost.commitId.toString() // This needs to be a commitID string to load, we're just loading the book we created earlier.
)
```

## Basic IDX Usage: 
IDX is a library that we've created to make interacting with Ceramic much easier, additionally IDX is used to access records from users in an incredibly simple fashion. To see more about IDX check out our [documentation site](https://developers.idx.xyz/){:target="_blank"}

### The Basic Profile
The basic profile (that's injected into every IDX instance) can be found [here](https://developers.ceramic.network/streamtypes/tile-document/schemas/basic-profile/){:target="_blank"}, this shows a lot of the details as well as the schema used.

Querying an IDX record is easy.

```JavaScript
let myProfile = await idx.get('basicProfile')
```

Now if you check out `myProfile` either through a console.log or by just typing it into your inspector console you should see nothing, but if you see something it just means you've created a profile with [self.id](https://clay.self.id){:target="_blank"}. 

Updating an IDX record is just as easy as querying one. The following is just my information, feel free to replace it with your own details. **NOTE:** If you have any information set previously the `idx.set()` command will overwrite it. If you want to maintain your details use `idx.merge('basicProfile', {/* same structure as below */})`, we will go into more detail a bit later in this document.

```JavaScript
myProfile = await idx.set('basicProfile', {
  name: '<YOUR NAME> ',
  emoji: '✌🏻', // most emoji's will work, if you get an error try a different one. Some are registered as 2 characters not one.
  description: "<YOUR DESCRIPTION>"
})
```

Updating a record is done using `idx.merge()`. The major difference between set & merge is that merge will only update the parameters given, set will set all parameters (even those not included).

```JavaScript
await idx.merge('basicProfile', {
  description: '<NEW DESCRIPTION>'
})
```

This can be checked quickly with `myProfile = await idx.get('basicProfile')`. You should see your changes reflected.

As mentioned above IDX was created to access records that aren't only yours. The playground has been preloaded with `exampleDID` & `exampleDID2` variables for you to use.

```JavaScript
await idx.get('basicProfile', exampleDID)
```

You should now see a basicProfile in your terminal, all you needed is a DID and you can see my record. If you've been following along you might remember the `controller` parameter we set for our `ceramicBlogPost`, similar to how you are the only person who can edit that post or update it in anyway you will be unable to update my record. This is because you aren't the controller, but what if we were to try? 

```JavaScript
await idx.set(
  'basicProfile', 
  { emoji: '💻' }, 
  exampleDID
)
```

Now to confirm that nothing got changed let's run an `idx.get()`.

```JavaScript
await idx.get('basicProfile', exampleDid)
```

You'll notice that our change wasn't applied at all. Which is great because it shouldn't have applied. 

## Getting our Blog Post ready for IDX
Now with what we've learned about IDX, let's get our book schema ready for use with IDX. This is a fairly simple process that we've helped make as straight forward as possible. 

For starters we will need to create a [definition](https://developers.ceramic.network/tools/idx/overview/#definitions){:target="_blank"} to tell IDX what we're developing.

```JavaScript
const blogDefinition = await createDefinition(ceramic, {
  name: 'Book Definition',
  description: 'A short book',
  schema: schema.commitId.toUrl() // Note this is a URL not a string. Ceramic urls are prefaced with ceramic://
})
```

Now we're ready to use this definition to create a record! We just need to use our new commit id we created above to create our records that will be automatically added to your IDX record. Creating a Definition will also enforce the structure of your schema, ensuring that the data requested will be provided.

```JavaScript
const newBlogPost = await idx.set(blogDefinition.commitId.toString(), {
  date: new Date().toISOString(),
  title: 'Hello IDX!',
  text: 'Welcome to IDX, data stored on the Ceramic Network'
})
```

Finally, we can get the details about our book, and any others we create almost as easily as we can get your basic profile.

```JavaScript
await idx.get(blogDefinition.commitId.toString())
```

## Congratulations! 
You now know how to work with both the core concepts of Ceramic & IDX, well done! Now come join our [Discord](https://chat.ceramic.network){:target="_blank"} & show us what you're going to make! If you want more tutorials and other posts feel free to see our [blog](https://blog.ceramic.network).