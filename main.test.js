const test = require('tape')
const main = require('./main')
const DOMParser = require('xmldom').DOMParser

const BUCKET_URL = 'BUCKET_URL'

test('parse xml contents from S3 as file objects', (t) => {
  t.plan(1);
  const xmlContents = [
    xmlWith({name: "FILE_1", size: "SIZE", lastModified: "TIME"}),
    xmlWith({name: "FILE_2", size: "SIZE", lastModified: "TIME"})
  ];

  const files = main.parseXml(BUCKET_URL, xmlContents)

  t.deepEqual(files, [
    {
      name: 'FILE_1',
      sizeInBytes: 'SIZE',
      lastModified: 'TIME',
      link: `<a class="text-secondary" href="${BUCKET_URL}/FILE_1">FILE_1</a>`,
    },
    {
      name: 'FILE_2',
      sizeInBytes: 'SIZE',
      lastModified: 'TIME',
      link: `<a class="text-secondary" href="${BUCKET_URL}/FILE_2">FILE_2</a>`,
    }
  ]);
});

test('convert time', (t) => {
  t.plan(1)

  const converted = main.convertTime('2019-12-31T10:34:44.000Z')

  t.equals(converted, 'Tue Dec 31 2019 10:34')
})

test('convert bytes to megabytes', (t) => {
  t.plan(1)

  const converted = main.bytesToMb('270447')

  t.equals(converted, '0.27')
})

test('extract query parameters', (t) => {
  t.plan(1)
  location = {search: {substring: () => 'KEY_1=VALUE_1&KEY_2=VALUE_2'}}

  const queries = main.extractQueryParameters()

  t.deepEquals(queries, [{'KEY_1': 'VALUE_1'}, {'KEY_2': 'VALUE_2'}])
})

test('get query variable', (t) => {
  t.plan(1)
  location = {search: {substring: () => 'KEY_1=VALUE_1&KEY_2=VALUE_2&KEY_2=VALUE_3'}}

  const value = main.getQueryValue('KEY_2')

  t.deepEquals(value, 'VALUE_2')
})

test('config priorities query variables', (t) => {
  t.plan(2)
  location = {search: {substring: () => 'bucket_name=BUCKET_NAME&region_url=REGION_URL'}}

  const config = main.loadConfig()

  t.equals(config.BUCKET_NAME, 'BUCKET_NAME')
  t.equals(config.REGION_URL, 'REGION_URL')
})

test('extract bucket name from the url', (t) => {
  t.plan(1)

  const bucket = main.bucketFromPath('/BUCKET_NAME/FILE_NAME')

  t.equals(bucket, 'BUCKET_NAME')
})

test('filter files by name', (t) => {
  t.plan(6)

  t.false(main.filterByName('PATTERN')({name: ''}))
  t.false(main.filterByName('PATTERN')({name: '/some/path/filename'}))
  t.true(main.filterByName('PATTERN')({name: 'pattern'}))
  t.true(main.filterByName('PATTERN')({name: 'PATTERN'}))
  t.true(main.filterByName('PATTERN')({name: '/some/path/PATTERN'}))
  t.true(main.filterByName('PATTERN')({name: '/some/path/my_pattern/filename'}))
})

const xmlWith = ({name, size, lastModified}) => toXml(`
    <Contents>
      <Key>${name}</Key>
      <Size>${size}</Size>
      <LastModified>${lastModified}</LastModified>
    </Contents>`)

const toXml = (string) => new DOMParser().parseFromString(string, 'text/xml')
