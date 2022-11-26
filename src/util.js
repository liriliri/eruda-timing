import last from 'licia/last'
import trim from 'licia/trim'
import Url from 'licia/Url'

export function getFileName(url) {
  let ret = last(url.split('/'))

  if (ret.indexOf('?') > -1) ret = trim(ret.split('?')[0])

  if (ret === '') {
    url = new Url(url)
    ret = url.hostname
  }

  return ret
}
