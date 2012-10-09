/*
 * Dynamic Configuration of CSS
 * By houkanshan (houkanshan a gmail com)
 *
 * set inline-style by Javascirpt 
 *
 */

(function(exports){

// some extend
if(!String.prototype.trim){
    String.prototype.trim  = function(){
        var str = this.replace('^\s/', ''),
            end = str.length - 1,
            ws = /\s/;
        while( ws.test(str.charAt(end)) ){
            end--;
        }

        return str.slice(0, end + 1);
    }
}

/**
 * @public {map} trans json to css
 */
function json2css(json){
    var styleStr = '';
    for(var i in json){
        styleStr += '\n' + i + ' {';
        for(var j in json[i]){
            styleStr += j + ':' + json[i][j] + ';';
        }
        styleStr += "}";
    }
    return styleStr;
}

/**
 *  @public {string} trans css to json, no comment out put
 */
function css2json(cssStr) {
    var cssInJson = {};

    // filter commebt
    var commentRe = /\/\*.*?\*\//g;
    cssStr.replace(commentRe, '');

    var rules = cssStr.split('}');
    for( var i = rules.length - 1; i--; ){
        var rulePair = rules[i].split('{');
        var selector = rulePair[0].trim();
        var props = rulePair[1].split(';');

        var curSelecor = {};
        cssInJson[selector] = curSelecor;

        for(var j = props.length - 1; j--; ){
            var propPair = props[j].split(':');
            curSelecor[propPair[0].trim()] = propPair[1].trim();
        }
    }

    return cssInJson;
}

/**
 * @private insert a css rule
 * @param {string} selector, optional to be a object
 * @param {object} propertys of the rule, optional to be a string
 *
 * insertRule('.selector', {color:'red', background: 'black'});
 * insertRule('.selector', 'color: red');
 *
 * TODO: insertRule(map)
 */
function insertRule(selector, propName, propValue){
    var rule = this.cssInJson[selector] || (this.cssInJson[selector] = {});

    if (typeof propName === 'object') {
        for(var name in propName){
            insertRule.call(this, selector, name, propName[name]);
        }
    }
    else {
        if(typeof propValue !== 'string' || typeof propName !== 'string'){
            throw TypeError('propName and propValue should be String');
        }
        rule[propName] = propValue;
    }
}

/**
 * @private get a css rule
 * @param {string} selector 
 * @param {string} propName, optional.
 *
 * getRule('.selector');
 * getRule('.selector', 'color');
 */
function getRule(selector, propName){
    var rule = this.cssInJson[selector];
    if(!rule){return;}

    if(propName){
        return rule[propName];
    };

    return rule;
}

/** 
 * @public get or set a css rule
 * @param {string} selector
 * @param {string} property name , optional to be a map
 * @param {string} value of the property, optional
 *
 * rule('.selector')
 * rule('.selector', 'color')
 * rule('.selector', 'color', 'black')
 * rule('.selector', {'color': 'black', 'background':'white'})
 */
function rule(selector, propName, propValue){
    if(!propName || (typeof propName === 'string' && !propValue)){
        return getRule.call(this, selector, propName);
    }
    return insertRule.call(this, selector, propName, propValue);
}

/** 
 * @public append the css-in-json to the style tag
 */
function render(){
    this.headElem = this.headElem || document.getElementsByTagName('head')[0];

    var styleElem = document.createElement('style');
    //styleElem.id= 'dcss-style';
    styleElem.type = 'text/css';
    //styleElem.media = 'screen';

    //TODO: test use innerHTML directly, see if will cause flash
    styleElem.innerHTML = json2css(this.cssInJson);
    this.headElem.appendChild(styleElem);

    var _this = this;
    setTimeout(function(){
        if(_this.styleElem){
            _this.headElem.removeChild(_this.styleElem);
        }

        _this.styleElem = styleElem;
    }, 1);
}


Dcss = {
    cssInJson: {},
    rule: rule,
    render: render,
    css2json: css2json,
    json2css: json2css
};

exports.Dcss = Dcss;

}(window));
