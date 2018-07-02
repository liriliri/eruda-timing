import util from './util'

module.exports = function(eruda) {
  let { evalCss, getFileName, $ } = eruda.util

  class Timing extends eruda.Tool {
    constructor() {
      super()
      this.name = 'timing'
      this._style = evalCss(require('./style.scss'))
      this._performanceTimingData = []
      this._performanceTiming = {}
      this._showPerformanceDetail = false
      this._resourceTimingData = []
      this._tpl = require('./template.hbs')

      let performance = (this._performance =
        window.webkitPerformance || window.performance)
      this._hasResourceTiming = performance && util.isFn(performance.getEntries)
    }
    init($el, container) {
      super.init($el, container)

      this._container = container
      this._bindEvent()
    }
    show() {
      super.show()

      this._render()
    }
    hide() {
      super.hide()
    }
    destroy() {
      super.destroy()
      evalCss.remove(this._style)
    }
    _bindEvent() {
      let $el = this._$el,
        container = this._container

      let self = this

      $el
        .on('click', '.eruda-performance-timing', function() {
          self._showPerformanceDetail = !self._showPerformanceDetail
          self._render()
        })
        .on('click', '.eruda-entry', function() {
          let idx = $(this).data('idx'),
            data = self._resourceTimingData[Number(idx)]

          if (data.initiatorType === 'img') {
            showSources('img', data.url)
          }
        })
        .on('click', '.eruda-refresh-resource-timing', () => {
          this._render()
        })

      function showSources(type, data) {
        let sources = container.get('sources')
        if (!sources) return

        sources.set(type, data)

        container.showTool('sources')
      }
    }
    _getPerformanceTimingData() {
      let performance = this._performance
      if (!performance) return

      let timing = performance.timing
      if (!timing) return

      let data = []

      /* eslint-disable no-unused-vars */
      let {
        navigationStart,
        unloadEventStart,
        unloadEventEnd,
        redirectStart,
        redirectEnd,
        fetchStart,
        domainLookupStart,
        domainLookupEnd,
        connectStart,
        connectEnd,
        secureConnectionStart,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        domComplete,
        loadEventStart,
        loadEventEnd
      } = timing

      let start = navigationStart,
        end = loadEventEnd,
        ready = true,
        total = end - start

      function getData(name, startTime, endTime) {
        let duration = endTime - startTime
        if (duration < 0) ready = false

        return {
          name: name,
          start: ((startTime - start) / total) * 100,
          duration: duration,
          len: (duration / total) * 100
        }
      }

      data.push(getData('Total', navigationStart, loadEventEnd))
      data.push(getData('Network/Server', navigationStart, responseStart))
      data.push(getData('App Cache', fetchStart, domainLookupStart))
      data.push(getData('DNS', domainLookupStart, domainLookupEnd))
      data.push(getData('TCP', connectStart, connectEnd))
      data.push(getData('Time to First Byte', requestStart, responseStart))
      data.push(getData('Response', responseStart, responseEnd))
      data.push(getData('Unload', unloadEventStart, unloadEventEnd))
      data.push(getData('DOM Processing', domLoading, domComplete))
      data.push(getData('DOM Construction', domLoading, domInteractive))

      if (!ready) return

      this._performanceTimingData = data

      let performanceTiming = {}
      ;[
        'navigationStart',
        'unloadEventStart',
        'unloadEventEnd',
        'redirectStart',
        'redirectEnd',
        'fetchStart',
        'domainLookupStart',
        'domainLookupEnd',
        'connectStart',
        'connectEnd',
        'secureConnectionStart',
        'requestStart',
        'responseStart',
        'responseEnd',
        'domLoading',
        'domInteractive',
        'domContentLoadedEventStart',
        'domContentLoadedEventEnd',
        'domComplete',
        'loadEventStart',
        'loadEventEnd'
      ].forEach(val => {
        performanceTiming[val] = timing[val] === 0 ? 0 : timing[val] - start
      })
      this._performanceTiming = performanceTiming
    }
    _getResourceTimingData() {
      if (!this._hasResourceTiming) return

      let entries = this._performance.getEntries(),
        data = []

      let totalTime = 0
      entries.forEach(entry => {
        if (entry.entryType !== 'resource') return
        if (entry.responseEnd > totalTime) totalTime = entry.responseEnd
      })

      entries.forEach(entry => {
        if (entry.entryType !== 'resource') return

        let timeline = {
          left: (entry.startTime / totalTime) * 100,
          connection:
            ((entry.requestStart - entry.startTime) / totalTime) * 100,
          ttfb: ((entry.responseStart - entry.requestStart) / totalTime) * 100,
          response:
            ((entry.responseEnd - entry.responseStart) / totalTime) * 100
        }

        data.push({
          name: getFileName(entry.name),
          displayTime: Math.round(entry.duration) + 'ms',
          url: entry.name,
          timeline,
          initiatorType: entry.initiatorType
        })
      })

      this._resourceTimingData = data
    }
    _render() {
      if (!this.active) return

      this._getResourceTimingData()

      let renderData = { entries: this._resourceTimingData }

      if (this._performanceTimingData.length === 0) {
        util.ready(() => {
          this._getPerformanceTimingData()
          this._render()
        })
      } else {
        this._getPerformanceTimingData()
      }
      renderData.data = this._performanceTimingData
      renderData.timing = this._performanceTiming
      renderData.showPerformanceDetail = this._showPerformanceDetail

      if (!renderData.timing && !renderData.entries)
        renderData.notSupported = true

      this._renderHtml(this._tpl(renderData))
    }
    _renderHtml(html) {
      if (html === this._lastHtml) return
      this._lastHtml = html
      this._$el.html(html)
    }
  }

  return new Timing()
}
