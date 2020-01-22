# Cross-Space Reference UI Extension

> This is for the moment internal only, we're refining it to make it public.


<!-- vim-markdown-toc GFM -->

* [Installation](#installation)
* [Configuring your space](#configuring-your-space)
* [Usage](#usage)
    * [On the Contentful Web App](#on-the-contentful-web-app)
        * [Configuration](#configuration)
        * [Selecting Entries](#selecting-entries)
    * [On your Applications](#on-your-applications)
        * [Credentials management](#credentials-management)
            * [When CMA Access is available](#when-cma-access-is-available)
            * [When only CDA is available](#when-only-cda-is-available)
        * [Reference fetching](#reference-fetching)
        * [Response consolidation](#response-consolidation)
            * [JSON inlining](#json-inlining)
            * [Schema stitching](#schema-stitching)
* [LICENSE](#license)

<!-- vim-markdown-toc -->

## Installation

```
npm install && npm run configure
```

This will install all dependencies, setup the Contentful CLI with your desired
target space and target environment.

## Configuring your space

Once the dependencies are installed, you need to install the extension in your space.

This will happen when you start running this package in development mode:

```
curl -X POST \
  -H'Content-Type: application/json' \
  -H'Authorization: Bearer YOUR-CMA-TOKEN-GOES-HERE' \
  -d'{"name": "Cross Space References", "src": "http://localhost:1234", "locations": [{"location": "app-config"}, {"location": "entry-field", "fieldTypes": [{"type": "Object"}]}]}' \
  https://api.contentful.com/organizations/YOUR-ORG-ID-GOES-HERE/app_definitions
```

Then go to `Apps` in the top navigation in the Contentful Web App, and select `Cross Space References`.
Follow the instructions in the screen to add configurations. Finally, click on `Install`.

Then create a new JSON field in any Content Type in your space,
and select the `Cross Space Reference` appearance.

Then serve the application by running:

```
npm run start
```

## Usage

The cross-space references app allows you to reference content from multiple other spaces into the current space.

Each cross-space reference enabled field can hold an array of refereneces
to entries from multiple different spaces.

References will be stored in the following format:

```json
{
  "entries": [
    {
      "title": "Nyan Cat",
      "contentTypeName": "Cat",
      "spaceId": "cfexampleapi",
      "spaceName": "Contentful Example API",
      "id": "nyancat"
    },
    {
      "title": "Black",
      "contentTypeName": "Product Variety",
      "spaceId": "c3dr2pww8hap",
      "spaceName": "Product Catalog",
      "id": "4ReNqiwXxeMeqmCwmI6COS"
    }
  ]
}
```

For each entry, you'll notice that there are a few available attributes readily stored.

*Cached attributes*:

* `title`: Display field's value
* `contentTypeName`: Content type's name
* `spaceName`: Space's name

Cached attributes are almost only useful for the Cross-space reference application itself,
they are used for creating a better user experience in the Contentful Web App.

*Development attributes*:

* `spaceId`: Space's ID
* `id`: Entry's ID

Development attributes are required for resolving references within your applications.
How to use these, will be explained in the section [On your Applications](#on-your-applications).

### On the Contentful Web App

Within the Contentful Web App, there's two important sections where you can interact
with the Cross-space references application.
For space administrators, the configuration page is where referenced space's credentials are set up.
For editors, the referenced entry view and entry selection view are going to be where
you'll be using the app the most.

#### Configuration

When initially starting installation of the application, you will find the following screen:

![First config]()

It contains a brief explanation of what this application does and
allows you to start setting up your referenced spaces.

To add your first configuration, click the `Add Space Configuration` button,
and the following dialog will appear, where you can fill up the required information.

![Add config dialog]()

> Space configurations won't be saved until the application is installed,
by clicking the `Install` button on the top right corner.

After completing installation, the `draft` configurations will now be saved and marked as `published`.

![Draft config]()

![Published config]()

You can keep adding more configurations afterwards, to save them,
click the `Save` button on the top right corner.

#### Selecting Entries

Once you've set up a JSON field for a content type to use the Cross-space references application appearance,
you'll see the following interface:

![First edit]()

Here you'll find a bit more description and the ability to add a reference.

For adding a reference, you can click the `Add a reference` button.

![Adding a reference empty]()

Here, you can select which space the reference will be coming from.

![Adding a reference space]()

You can then filter by content type.

![Adding a reference content type]()

And optionally, you can perform a full text search to refine your results even further.

![Adding a reference search]()

Once the reference is selected, it will appear in the list of references,
and you can repeat the process to add more.

Both when selecting entries and browsing through the list of current entries,
you can click the triple dot icon on the right side of the reference,
which will open a contextual menu with some additional options.

### On your Applications

Developing applications that require access to multiple spaces is a complex process,
but it can be compartimentalised into three main areas that require solving:

* Credentials management
* Reference fetching
* Response consolidation

We'll explain some of the possibilities to solve these areas offering a few different scenarios.

#### Credentials management

To access content across several spaces, you need a way to have access to the content itself.
In Contentful all content in the Content Delivery API (CDA) is protected through an OAuth token
that is generated by your space administrator. Therefore, to read any of the content we have referenced
in our space, we need a way to retrieve the credentials we have configured earlier.

Depending our how your application is set up, you may need to manage said credentials in different ways

##### When CMA Access is available
##### When only CDA is available

#### Reference fetching

#### Response consolidation
##### JSON inlining
##### Schema stitching

## LICENSE

MIT
