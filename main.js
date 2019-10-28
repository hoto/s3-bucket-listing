console.log("Running main.js ...")

const XHR_REQUEST_FINISHED = 4

let config

const main = () => {
  console.log('Running main()...')
  config = loadConfig()
  const xhr = new XMLHttpRequest()
  xhr.open('get', `http://${config.BUCKET_NAME}.${config.REGION_URL}`)
  xhr.onreadystatechange = loadFiles(xhr)
  xhr.send()
}

const loadConfig = () => ({
  BUCKET_NAME: getQueryValue('bucket_name') || bucketFromPath(location.pathname),
  REGION_URL: getQueryValue('region_url') || location.hostname
})

const loadFiles = (xhr) => () => {
  if (xhr.readyState === XHR_REQUEST_FINISHED) {
    const xmlContents = Array.from(xhr
      .responseXML
      .getElementsByTagName('Contents'))
    const bucketHttpsUrl = `https://${config.REGION_URL}/${config.BUCKET_NAME}`
    const files = parseXml(bucketHttpsUrl, xmlContents)
    document
      .getElementById('s3-files')
      .innerHTML = files.map(toHtml).join('')
  }
}

const parseXml = (bucketUrl, xmlContents) => xmlContents
  .map(file => ({
    name: extractField(file, 'Key'),
    sizeInBytes: extractField(file, 'Size'),
    lastModified: extractField(file, 'LastModified')
  }))
  .map(file => ({
    link: `<a class="text-secondary" href="${bucketUrl}/${file.name}">${file.name}</a>`,
    ...file
  }))

const extractField = (file, field) =>
  file.getElementsByTagName(field)[0].firstChild.data

const toHtml = (file) =>
  `<div class="columns">
     <div class="column col-1">
        <div class="tooltip tooltip-left" data-tooltip="${file.sizeInBytes} B">
          ${bytesToMb(file.sizeInBytes)} M
        </div>
     </div>
     <div class="column col-2">
        <div class="tooltip tooltip-left" data-tooltip="${file.lastModified}">
          ${convertTime(file.lastModified)} 
        </div>
     </div>
     <div class="column col-9">${file.link}</div>
   </div>`

const bytesToMb = (bytes) => {
  const mb = bytes / 1000000
  const twoDecimals = Math.round(mb * 100) / 100
  return `${twoDecimals}`
}

const convertTime = (time) => {
  const date = new Date(time)
  const hour = date.getHours()
  const minutes = date.getMinutes()
  return `${date.toDateString()} ${hour}:${minutes}`
}

const getQueryValue = (variableName) =>
  extractQueryParameters()
    .filter(queryPair => !!queryPair[variableName])
    .map(queryPair => queryPair[variableName])
    .values()
    .next()
    .value

const extractQueryParameters = () => {
  return location
    .search
    .substring(1)
    .split('&')
    .map(queryPair => queryPair
      .split('=')
      .reduce((total, current, index, array) => {
        total[array[0]] = array[1]
        return total
      }, {})
    )
}

const bucketFromPath = (url) => {
  return url.split('/')[1]
}

if (typeof module !== 'undefined') {
  module.exports = {
    loadConfig,
    parseXml,
    convertTime,
    bytesToMb,
    extractQueryParameters,
    getQueryValue,
    bucketFromPath,
  }
}
