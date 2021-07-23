# Ceramic Playground Quickstart (& Video Reference)
## Getting Started
1. Click on the "Connect Wallet" Button, if you don't have a wallet MetaMask is a good place to start.
2. Follow the prompts that are in the upper right hand corner to authenticate with 3ID-Connect. 
   - After you authenticate open your web browser tools, you should see something like: `Connected with DID: did:3:kjz...r5y`. If you do not see this please reach out in Discord.

## Basic IDX Usage: 
Let's create a basic profile, this is a default schema so it's easy. All of the following commands can be completed in the web brower's console.

1. `await idx.get('basicProfile', ceramic.did.id)`
  - IDX.get has 1 mandatory parameter that is a string, usually it isn't so readable. This is readable because it's been aliased. For more information see: https://developers.idx.xyz/build/aliases/
  - Then we need to "sign" the request, in the Playground we access it from the Ceramic instance. It's generated when you authenticate with 3ID-Connect.
  - OUTPUT: ` `
   - There will be nothing here because there's no profile attached to the DID.
2. `await idx.set('basicProfile', { name: 'Your Name', description: 'Tell us about yourself!' emoji:'✌🏻' })`
  - Notice that we did not provide our DID, but it's updating our record. This is because we default to the currently active ID.
  - These fields are optional, but they can be set to be required by the schema.
3. `await idx.merge('basicProfile', { emoji: '👍🏻'})`
   - Updating records is easy, change any details you need to anytime you need to.

## Creating a Custom Schema:
Schema creation might seem daunting at first, but it's quite simple when you understand how it's all built. 

### Helper Functions:
To start we will need to create a few helper functions. These are all included in our `@ceramicstudio/idx-tools` package, this is just to demystify them. To use them you can just copy & paste the code into your browser console.
1. Create Tile
    ```javascript
      /**
      	* Create Tile is a simple function to create a TileDocument on the Ceramic Network.
      	*/
      const createTile = async (ceramic, content, metadata) => {
      	if (ceramic.did == null) {
          throw new Error('Ceramic instance is not authenticated')
        }

        if (metadata.controllers == null || metadata.controllers.length === 0) {
          metadata.controllers = [ceramic.did.id] // if there's no controllers in the metadata, we assume that you're the only controller and automatically set it for you.
        }

      	// TileDocuments are what make up our Ceramic Network. 
        const doc = await TileDocument.create(ceramic, content, metadata)
        await ceramic.pin.add(doc.id) // Here we pin the stream to an IPFS Node.
        
      	return doc
      }
    ```
2. Create Schema
    ```javascript
      const createSchema = async (ceramic, doc) => {
        if(doc.id == null) {
          return await createTile(ceramic, doc.content, {
            controllers: doc.controllers,
            schema: doc.schema ? docIDToString(doc.schema) : undefined
          })
        }

        const loaded = await TileDocument.load(ceramic, doc.id)
        console.log(loaded)
        return loaded
      }
    ```
3. Create Definition
    ```javascript
      /**
      	* Definitions are a key part of how Ceramic categorizes data.
      	* Without the definition the schema is inaccessible. 
      	*/
      const createDefinition = async (ceramic, definition) => {
      	// We use our createTile helper to create our definition tile. 
      	return await createTile(ceramic, 
      		definition, 
      		{
      			schema: 'ceramic://k3y52l7qbv1fry1fp4s0nwdarh0vahusarpposgevy0pemiykymd2ord6swtharcw'
      		})
      }
    ```

### Creating & Using Custom Schemas
Simply put a schema is just a JSON object. The following will create a super simple blog post schema. 
```JSON
  const blogSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#', // required
    title: 'Blog', // required
    type: 'object', // required
    properties: { // all properties are optional.
      date: {
        type: 'string',
        format: 'date-time',
        title: 'date',
        maxLength: 30,
      },
      title: {
        type: 'string',
        title: 'title',
        maxLength: 50
      },
      text: {
        type: 'string',
        title: 'text',
        maxLength: 4000,
      },
    },
  }
```
You can create any schema you want, but we'll be using the above schema for the guide.

1. Create Schema: `const schema = await createSchema(ceramic, { controllers: [ceramic.did.id], content: blogSchema})`
   - Note that we're using our createSchema function from the Helper Functions section.
   - The controllers parameter is optional and will default to the current DID. However, if you need more than one DID to control the schema (and any content created) they need to be listed in the controllers section.
2. Create Definition: 
    ```javascript
      const definition = await createDefinition(ceramic, {
        name: 'User-Centric Blog',
        description: "A blog type where the content is stored with the user, not a server.",
        schema: schema.commitId.toUrl()
      })
    ```
   - The definition is a critical part of Ceramic's Infrastructure
   - the following is the structure used:
     - ```
        DID -> Index -> Definition -> Record
                            ^
                        Schema
      ```
3. Create Blog Post:
   - ```javascript
      await idx.set(definition.id, {
        date: new Date().toISOString(), 
        title: 'hello world!',
        text: 'Your first user-centric blog post ✌🏻'
      })
    ```
4. Get Blog Post:
    ```javascript
      await idx.get(definition.id)
    ```
