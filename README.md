# Instructions:

#### Step 1:
If this is your very first run, you must first call `./automate` in the project's rootdir.

*Pro tip: In the project's rootdir: Click on the address bar and type `powershell` to open a ps console at the current dir*

When you get to the first prompt, `Skip initializing?` press `n` for NO, then `y` for YES to run the script.
init.bat will go over the different directories and will call 'npm i', respectively

#### Step 2:
On the first run you must SKIP BOTH next skip prompts, ie: Skip both Outputs and React build,
since those depend on resources that are not yet created, therefore the outputs.json files would be empty and no integration would occur!

#### Step 3:
Dont worry about errors or misbehavior right now, you have to rerun the script without skipping the prompts.
But first! Prepare the lambda layers: `mongodb-layer` and `users-node-modules`!
*To do that, from the project's rootdir, call in powershell:*
* `./users/prepare-layer.bat`
* `./Scraper-layered/mongodb-layer/prepare-layer.bat`
* These will be automated as well... this is temporary!

Now rerun the script, SKIP initialization and do NOT skip the other two prompts, to NOT skip outputs and react build
        
#### Step 4:
*Watch everything go up automatically, including, but not limited to:*
        
        - Outputting outputs.json to different directories for automating some integrations between different parts

        - Automatically zip and upload:
                - New React builds based on changes to different core files

        - Applying changes to resources, based on changes to source code, ie:
                - New users lambda based on changes to different core files
                - New HTTPHandler lambda based on changes to different core files
                - New DAL lambda based on changes to different core files
                - New Scraper lambda based on changes to different core files
                - New Scraper-layered lambda based on changes to different core files
        *Automatically zipped and deployed*

        - Uploading a directory to S3 with correct metadata, ie: Correct Content-Types!!!!!!

        - Get AWS ECR credentials and login to docker, then build docker images and push them to ECR, ALL automatic!

        - Other stuff i forgot i packed in
        
#### Step 5:
After running `./automate` twice, you should have all the cloud resources up and all the dependencies installed, also, the frontend should be built and hosted on S3 with a CloudFront distribution serving it.

#

###### Not only is it automatic it is also colorful and interactive!

#

***Currently working endpoint: https://d8ev7ren9xjon.cloudfront.net***

**Added a bunch of stuff, will update everything later.**

All rights reserved to Vinny for being awesome!
