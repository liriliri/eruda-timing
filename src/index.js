import util from './util';

module.exports = function (eruda) 
{
    let {evalCss, getFileName, $} = eruda.util;

    class Timing extends eruda.Tool {
        constructor() {
            super();
            this.name = 'timing';
            this._style = evalCss(require('./style.scss'));
            this._performanceTimingData = [];
            this._performanceTiming = {};
            this._resourceTimingData = [];
            this._tpl = require('./template.hbs');

            let performance = this._performance = window.webkitPerformance || window.performance;
            this._hasResourceTiming = performance && util.isFn(performance.getEntries);
        }
        init($el, container) 
        {
            super.init($el, container);

            this._container = container;
            this._bindEvent();
        }
        show() 
        {
            super.show();

            this._render();
        }
        hide()
        {
            super.hide();
        }
        destroy() 
        {
            super.destroy();
            evalCss.remove(this._style);
        }
        _bindEvent() {
            let $el = this._$el,
                container = this._container;

            let self = this;

            $el.on('click', '.eruda-performance-timing', function ()
            {
                $el.find('.eruda-performance-timing-data').show();
            }).on('click', '.eruda-entry', function ()
            {
                let idx = $(this).data('idx'),
                    data = self._resourceTimingData[Number(idx)];

                if (data.initiatorType === 'img')
                {
                    showSources('img', data.url);
                }
            }).on('click', '.eruda-clear-xhr', function ()
            {
                self._requests = {};
                self._render();
            });

            function showSources(type, data)
            {
                let sources = container.get('sources');
                if (!sources) return;

                sources.set(type, data);

                container.showTool('sources');
            }
        }
        _getPerformanceTimingData()
        {
            let performance = this._performance;
            if (!performance) return;
    
            let timing = performance.timing;
            if (!timing) return;
    
            let data = [];
    
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
            } = timing;
    
            let start = navigationStart,
                end = loadEventEnd,
                total = end - start;
    
            function getData(name, startTime, endTime)
            {
                let duration = endTime - startTime;
    
                return {
                    name: name,
                    start: (startTime - start) / total * 100,
                    duration: duration,
                    len: duration / total * 100
                };
            }
    
            data.push(getData('Total', navigationStart, loadEventEnd));
            data.push(getData('Network/Server', navigationStart, responseStart));
            data.push(getData('App Cache', fetchStart, domainLookupStart));
            data.push(getData('DNS', domainLookupStart, domainLookupEnd));
            data.push(getData('TCP', connectStart, connectEnd));
            data.push(getData('Time to First Byte', requestStart, responseStart));
            data.push(getData('Response', responseStart, responseEnd));
            data.push(getData('Unload', unloadEventStart, unloadEventEnd));
            data.push(getData('DOM Processing', domLoading, domComplete));
            data.push(getData('DOM Construction', domLoading, domInteractive));
    
            this._performanceTimingData = data;
    
            let performanceTiming = {};
            [
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
            ].forEach((val) =>
            {
                performanceTiming[val] = timing[val] === 0 ? 0 : timing[val] - start;
            });
            this._performanceTiming = performanceTiming;
        }
        _getResourceTimingData()
        {
            if (!this._hasResourceTiming) return;
    
            let entries = this._performance.getEntries(),
                data = [];
    
            entries.forEach(entry =>
            {
                data.push({
                    name: getFileName(entry.name),
                    displayTime: formatTime(entry.duration),
                    url: entry.name,
                    initiatorType: entry.initiatorType
                });
            });
    
            this._resourceTimingData = data;
        }
        _render()
        {
            if (!this.active) return;
    
            this._getResourceTimingData();
    
            let renderData = {entries: this._resourceTimingData};

            util.ready(() => {
                this._getPerformanceTimingData();
                this._render();
            });
            renderData.data = this._performanceTimingData;
            renderData.timing = this._performanceTiming;
    
            this._renderHtml(this._tpl(renderData));
        }
        _renderHtml(html)
        {
            if (html === this._lastHtml) return;
            this._lastHtml = html;
            this._$el.html(html);
        }
    }

    return new Timing();
};

function formatTime(time)
{
    time = Math.round(time);

    if (time < 1000) return time + 'ms';

    return (time / 1000).toFixed(1) + 's';
}