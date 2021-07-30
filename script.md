# If you're seeing this please tell Liz she forgot it.

# Setup
1. Open Playground App.
2. Open console (right click menu => inspect)
3. Connect to wallet.

_In dev tools_
- // Let's start with Ceramic.

/* Record Creation */
```JavaScript
const tile = await createTile(ceramic, {hello: 'world'})
```
// This is the most basic records that can be stored in the Ceramic network
// The tile can be queried like so:
```JavaScript
const loadedTile = await TileDocument.load(ceramic, tile.id.toString())
```
// Super simple :)

/* Schemas */ 
// Schemas are Streams created by app developers that store a JSON schema. 
// They specify the data schema of a record. 
// Schemas are identified by the streamID of the stream that stores the Schema.
// The following is a schema we'll use for the rest of this guide.
```JavaScript
const blogSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#', // this is required.
  title: 'Blog Post', // required
  type: 'object', // required
  properties: {
    date: {
      type: 'string',
      format: 'date-time',
      title: 'date',
      maxLength: 30,
    }, // any further properties are optional.
    title: {
      type: 'string',
      title: 'title',
      maxLength: 50
    },
    text: {
      type: 'string',
      title: 'text',
      maxLength: 4000
    }
  }
}
```
// as you can see we've created a the core of what a blog post is.
// Let's commit this to the Ceramic Network.
```JavaScript
const schema = await TileDocument.create(ceramic, blogSchema)
```

// We can now use this to create a new record!
```JavaScript
const ceramicBlogPost = await TileDocument.create(
  ceramic, 
  {
    date: new Date().toISOString(), 
    title: 'Hello Ceramic Network',
    text: 'My First Ceramic Post'
  },
  {
    controllers: [ceramic.did.id],
    family: 'Blog Post',
    schema: schema.commitId.toString()
  }
)
```
// There you have it, your first blog post has been added to the network! Let's see it now.
```Javascript
const loadedPost = await TileDocument.load(ceramic, ceramicBlogPost.commitId) 
```
_in console_
loadedPost.content
// Now you should see your blog post! Though, we can make this even better.

/* IDX */
// IDX is a way to access data stored in ceramic, by the DID of the user that created it.
// Let's start with seeing your profile. 
```JavaScript
let myProfile = await idx.get('basicProfile')
```
// Don't be worried if nothing returns. Just means you don't have a created.
// Let's fix this though.
```JavaScript
await idx.set('basicProfile', {
  name: '<YOUR NAME> ',
  emoji: '✌🏻', // most emoji's will work, if you get an error try a different one. Some are registered as 2 characters not one.
  description: "<YOUR DESCRIPTION>"
})
```
// We can also add details with IDX.
```JavaScript
await idx.merge('basicProfile', {
  description: '<NEW DESCRIPTION>'
})
```
// now let's see those changes! 
```JavaScript
myProfile = await idx.get('basicProfile')
```

// Where IDX really shines is in being able to look up information with just a users' DID. 
// if we run the following we can load a profile that isn't ours.
```JavaScript
let loadedProfile = await idx.get('basicProfile', elizabethDID)
```
// Let's try to update a profile that isn't ours.
```JavaScript
let notMyProfile = await idx.set('basicProfile', {emoji: '👌🏻'}, elizabethDID)
```
// Now to query it.
```JavaScript
notMyProfile = await idx.get('basicProfile', elizabethDID)
```
// Notice that no changes were made. That's because we're not the controller of that stream.

// Let's revisit our blog for a moment.
// We can greatly improve it with what we've learned about IDX.
// IDX uses 'Definitions' to know what schema is being used.
// the basicProfile we've been loading is an aliased string for simplicity.
// Let's create a Definition for our Blog posts.
```JavaScript
const blogDefinition = await createDefinition(ceramic, {
  name: 'Blog Post',
  description: 'A blog post',
  schema: schema.commitId.toUrl()
})
```
// Now you can use the blogDefinition commitId to create a group of posts.
// This can also be aliased in the same way that our 'basicProfile' is.
```JavaScript
const aliases = {
  basicProfile: 'kjzl6cwe1jw14bdsytwychcd91fcc7xibfj8bc0r2h3w5wm8t6rt4dtlrotl1ou',
  blogPosts: blogDefinition.commitId.toString()
}
```


// Thats it! You've worked with both Ceramic & IDX and created data on the Ceramic Network. 
// If you want to chat more about Ceramic or IDX join us at https://chat.ceramic.network, we'd love to see what you build!
// You can also find our documentation linked in the sites main page if you want more details.