# S3 Bucket Listing

Still WIP

Code is terrible, written for pure enjoyment of hacking some JS at midnight.  
But it works! And it supports HTTPS! And has a dark theme!

### Development

### Run tests

    npm run test

#### Run locally against an existing publicly available S3 bucket from localhost.

To avoid uploading the `list.html` file every time to an S3 bucket you can run 
Chrome with disabled web security in order to ignore CORS policy:

    google-chrome \
        --disable-web-security \
        --allow-file-access-from-files \
        --user-data-dir=/tmp/chrome-user-data \
        --no-sandbox
        
    localhost:{port}/list.html?bucket_name={bucket}&region_url={region}&file_name_filter={filter}