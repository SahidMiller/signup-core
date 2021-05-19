# Signup Core

This branch includes code to demonstrate a dweb version of Signup.cash using peer-to-peer technology via IPFS/IPNS/Libp2p.
## IPFS 

This project opts out of using IPNS on the user facing side and instead separates out a basic app shell from more often changing code (ie. plugins). The [app shell](https://github.com/SahidMiller/signup-core/tree/ipfs-app-shell/packages/shell) is a simple webpack host application that dynamically loads wallet code via IPNS and locks the version in until the user decides to update it, in which case, it still won't affect the app shell CID since it's dynamic.

Users are expected to evaluate if the app shell meets their security needs and if it suits their needs, they can continue using it until they choose to upgrade or use another CID that fits their needs.

In other words, this application treats CIDs as a feature rather than a UX bug.

## Module federation

This project leverages Webpack Dynamic [Module Federation](https://webpack.js.org/concepts/module-federation/) to separate the often changing wallet code from a basic app shell.

This is useful for a number of reasons with our use case:

1) The app shell will have a static CID that's visually verifiable which is useful whether you use a gateway you own or not.
2) By having plugin code fetched via CID, the app shell can fetch and verify version by simply persisting the CID (possibly signed by user) so it only changes when the user requests it.
3) Developers can create their own app shell and leverage the wallet code in a similar way as this project's app shell.

## IPNS

This project leverages IPNS to publish latest CIDs of each project. 

1) Makes updating HTML or migrating storage on version change redundant for users who prefer it, saving complexity.
    a) For example, when the provider app is embedded using IPNS url, they get the latest provider code and latest app shell and wallet CIDS without changing HTML!
    b) For example, when the app shell is launched using IPNS url, users get the latest app shell without migrating data. 

2) Allows older code to fetch newer hashes verifiably. 
    a) For example, when the provider app is embedded using IPFS url (not ipns) they can still verifiably fetch and launch the latest app shell CID for new users. (TODO God willing: add tab to app shell or wallet to allow users to set a redirect back to an older app shell automatically on their preferred gateway).
    b) For example, when the app shell is launched using IPFS url (not ipns) users can still verifiably fetch the latest app shell, wallet, and plugin CIDs and be notified they're available! (users can verify app shell doesn't launch code without getting permission from user)

### Building

This project leverages a [custom webpack plugin](https://github.com/sahidmiller/WebpackDagEntryPlugin) to provide latest CIDs of dependent projects to their dependents. This is essentially making the CID of the current version available to sibling projects. This is useful for a number of reasons:

1) Makes fetching from IPNS redundant if there aren't any updates (ie. when not calling from an old version), saving time.
    a) For example, when using an IPNS provider.js embed, they will have the latest provider code and so can opt out of fetching latest app shell CID since it's included, God willing.

2) Makes fetching from IPNS redundant if you WANT the same content as existed at build/deploy time, saving time.
    a) For example, when using a provider.js embed (ipns or non-ipns), the embedder may prefer to only use the existing app shell by default until they upgrade the provider or whitelist versions (TODO God willing: allow provider embeds to lock in version of app shell).
    
## Support

Want to support Signup wallet? Send us a tip in Bitcoin Cash to this address. We spend all the funds for coffee and code! => bitcoincash:qqqes3ygxpx589wfn44kqlhqzda8zscf952xxxa2au
