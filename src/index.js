module.exports = function (eruda) 
{
    let {evalCss} = eruda.util;

    class Timing extends eruda.Tool {
        constructor() {
            super();
            this.name = 'timing';
            this._style = evalCss(require('./style.scss'));
        }
        init($el, container) 
        {
            super.init($el, container);
            $el.html(require('./template.hbs')());
        }
        show() 
        {
            super.show();
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
    }

    return new Timing();
};