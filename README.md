# Pretty Colors: Next.js Add-on

This is a [Meet Add-on](https://developers.google.com/meet/add-ons/guides/overview) built in [Next.js](https://nextjs.org/). This add-on displays an animation that is intended to create a simple "shimmer" effect based on the color that each call participant selects. This add-on only exists to show more features of Google Meet Add-ons than can be found at [googleworkspace/meet/addons-web-sdk/samples/hello-world-next-js](https://github.com/googleworkspace/meet/tree/main/addons-web-sdk/samples/hello-world-next-js). If you find anything about the configuration confusing, please see that more basic example.

This add-on is deployed with GitHub pages, so that you can view the live versions of its [Side Panel](https://googleworkspace.github.io/meet/animation-next-js/sidepanel), [Main Stage](https://googleworkspace.github.io/meet/animation-next-js/mainstage), and all other routes. The screensharing promotion at the [index.html](https://googleworkspace.github.io/meet/animation-next-js/) will not fully work until this add-on is published.

Don't install glcoud from snap. You won't let you install the terraform extension
terraform can be installed from snap


`terraform plan`

`storage: object doesn't exist`? -> `gcloud auth application-default set-quota-project no-meeting-overtime`

`oauth2: "invalid_grant" "Token has been expired or revoked."`? -> `gcloud auth application-default login`

`failed precondition: due to quota restrictions, cannot run builds in this region, see https://cloud.google.com/build/docs/locations#restricted_regions_for_some_projects ` when building. Go to Quota > Cloud Build API > Concurrent Build CPUs (Regional Public Pool) per region per build_origin and request a value > 0