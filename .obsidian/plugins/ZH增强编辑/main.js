'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
使用声明
本插件基于多款社区插件开发而成，蚕子水平有限，代码或许存在缺陷，不能保证任何用户或任何操作均为正常，
请您在使用本插件之前，先备份好Obsidian笔记库，谢谢配合。
开发：蚕子 QQ：312815311 更新时间：2021-9-7
***************************************************************************** */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var Settings = /** @class */ (function () {
    function Settings() {
        this.defaultChar = '\n、';
        this.简体字表 = "";
        this.繁体字表 = "";
    }
    Settings.prototype.toJson = function () {
        return JSON.stringify(this);
    };
    Settings.prototype.fromJson = function (content) {
        var obj = JSON.parse(content);
        this.defaultChar = obj['defaultChar'];
        this.简体字表 = obj['简体字表'];
        this.繁体字表 = obj['繁体字表'];
    };
    return Settings;
}());

var MyPlugin = /** @class */ (function (_super) {
	var allText = "";
    var cursorPosition;
    __extends(MyPlugin, _super);
    function MyPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.settings = new Settings();
        _this.SETTINGS_PATH = '.obsidian/plugins/ZH增强编辑/text.json';
        return _this;
    }
    MyPlugin.prototype.onload = function () {
    	return __awaiter(this, void 0, void 0,
        function() {
            var _this = this;
            return __generator(this,
            function(_a) {
		        console.log('加载插件');
		        _this.addCommand({
		            id: 'internal-link',
		            name: '[[链接]]语法',
		            callback: function () {	_this.转换内链语法();},
		            hotkeys: [{ modifiers: ["Alt"], key: "Z" } ]
		        });
                _this.addCommand({
		            id: 'biaoti0-text',
		            name: '取消标题语法',
		            callback: function () {	_this.标题语法("");},
		            hotkeys: [{ modifiers: ["Mod"], key: "`" } ]
		        });
                _this.addCommand({
		            id: 'biaoti1-text',
		            name: 'H1标题语法',
		            callback: function () {	_this.标题语法("#");},
		            hotkeys: [{ modifiers: ["Mod"], key: "1" } ]
		        });
                _this.addCommand({
		            id: 'biaoti2-text',
		            name: 'H2标题语法',
		            callback: function () {	_this.标题语法("##");},
		            hotkeys: [{ modifiers: ["Mod"], key: "2" } ]
		        }); 
                _this.addCommand({
		            id: 'biaoti3-text',
		            name: 'H3标题语法',
		            callback: function () {	_this.标题语法("###");},
		            hotkeys: [{ modifiers: ["Mod"], key: "3" } ]
		        }); 
                _this.addCommand({
		            id: 'biaoti4-text',
		            name: 'H4标题语法',
		            callback: function () {	_this.标题语法("####");},
		            hotkeys: [{ modifiers: ["Mod"], key: "4" } ]
		        }); 
                _this.addCommand({
		            id: 'biaoti5-text',
		            name: 'H5标题语法',
		            callback: function () {	_this.标题语法("#####");},
		            hotkeys: [{ modifiers: ["Mod"], key: "5" } ]
		        }); 
                _this.addCommand({
		            id: 'biaoti6-text',
		            name: 'H6标题语法',
		            callback: function () {	_this.标题语法("######");},
		            hotkeys: [{ modifiers: ["Mod"], key: "6" } ]
		        });                  
                _this.addCommand({
		            id: 'gaoliang-text',
		            name: '==高亮==语法',
		            callback: function () {	_this.转换高亮语法();},
		            hotkeys: [{ modifiers: ["Alt"], key: "G" } ]
		        }); 
                _this.addCommand({
		            id: 'zhuozhong-text',
		            name: '`行内代码`语法',
		            callback: function () {	_this.转换行内代码();},
		            hotkeys: [{ modifiers: ["Alt"], key: "`" } ]
		        });     
                _this.addCommand({
		            id: 'add-daima',
		            name: '```代码块```',
		            callback: function () {	_this.转换代码块();},
		            hotkeys: [{ modifiers: ["Mod","Shift"], key: "m" } ]
		        });
                _this.addCommand({
		            id: 'add-up',
		            name: '上标语法',
		            callback: function () {	_this.转换上标();},
		            //hotkeys: [{ modifiers: ["Mod","Shift"], key: "m" } ]
		        });
                _this.addCommand({
		            id: 'add-ub',
		            name: '下标语法',
		            callback: function () {	_this.转换下标();},
		            //hotkeys: [{ modifiers: ["Mod","Shift"], key: "m" } ]
		        });
                _this.addCommand({
		            id: 'add-kh1',
		            name: '【选文】',
		            callback: function () {	_this.括选文本1();},
		        });
                _this.addCommand({
		            id: 'add-kh2',
		            name: '（选文）',
		            callback: function () {	_this.括选文本2();},
		        });
                _this.addCommand({
		            id: 'add-kh3',
		            name: '「选文」',
		            callback: function () {	_this.括选文本3();},
		        });
                _this.addCommand({
		            id: 'add-kh4',
		            name: '《选文》',
		            callback: function () {	_this.括选文本4();},
		        });
                _this.addCommand({
		            id: 'ying-zhong',
		            name: '英转中文标点',
		            callback: function() { _this.英转中文标点(); },
		            hotkeys: [{ modifiers: ["Mod","Shift","Alt"], key: "Z" } ]
		        });
                _this.addCommand({
		            id: 'zhong-ying',
		            name: '中转英文标点',
		            callback: function() { _this.中转英文标点(); },
		            hotkeys: [{ modifiers: ["Mod","Shift","Alt"], key: "Y" } ]
		        });
                _this.addCommand({
		            id: 'file-path',
		            name: '转换路径',
		            callback: function() { _this.转换路径(); },
		            hotkeys: [{ modifiers: ["Shift","Alt"], key: "F" } ]
		        });
                _this.addCommand({
		            id: 'jian-fan',
		            name: '简体转繁',
		            callback: function() { _this.简体转繁(); },
		            // hotkeys: [{ modifiers: ["Mod","Shift","Alt"], key: "F" } ]
		        });
                _this.addCommand({
		            id: 'fan-jian',
		            name: '繁体转简',
		            callback: function() { _this.繁体转简(); },
		            // hotkeys: [{ modifiers: ["Mod","Shift","Alt"], key: "J" } ]
		        });

                _this.addCommand({
		            id: 'paste-form',
		            name: '粘贴表格',
		            callback: function() { _this.粘贴表格(); },
		            hotkeys: [{ modifiers: ["Mod","Alt"], key: "V" } ]
		        });
                _this.addCommand({
		            id: 'edit-jiucuo',
		            name: '修复错误语法',
		            callback: function() { _this.修复错误语法(); },
		            hotkeys: [{ modifiers: ["Mod","Shift"], key: "J" } ]    
		        });
                _this.addCommand({
		            id: 'del-line2',
		            name: '修复意外断行',
		            callback: function() { _this.修复意外断行(); },
		            hotkeys: [{ modifiers: ["Mod","Alt"], key: "D" } ]
		        });
                _this.addCommand({
		            id: 'search-text',
		            name: '搜索当前文本',
		            callback: function() { _this.搜索当前文本(); }
		        });         
                _this.addCommand({
		            id: 'view-time',
		            name: '获取时间信息',
		            callback: function () {	_this.获取时间信息();},
		            hotkeys: [{ modifiers: ["Mod","Shift"],key: "T"}]
		        });
                _this.addCommand({
		            id: 'tiqu-text',
		            name: '获取标注文本',
		            callback: function () {	_this.获取标注文本();},
		            hotkeys: [{ modifiers: ["Mod","Shift"],key: "B"}]
		        });
                _this.addCommand({
		            id: 'copy-text',
		            name: '获取无语法文本',
		            callback: function () {	_this.获取无语法文本();},
		            hotkeys: [{ modifiers: ["Mod","Alt"],key: "C"}]
		        });
                _this.addCommand({
		            id: 'copy-filePath',
		            name: '获取相对路径',
		            callback: function() { _this.获取相对路径(); }  
		        });               

		        _this.addCommand({
		            id: 'add-lines',
		            name: '批量插入空行',
		            callback: function() { _this.批量插入空行(); },
		            hotkeys: [{ modifiers: ["Mod","Shift"], key: "l" } ]    
		        });
		        _this.addCommand({
		            id: 'del-lines',
		            name: '批量去除空行',
		            callback: function() { _this.批量去除空行(); },
		            hotkeys: [{ modifiers: ["Mod","Alt"], key: "l" } ]
		        });
                _this.addCommand({
		            id: 'add-space',
		            name: '末尾追加空格',
		            callback: function() { _this.末尾追加空格(); },
		            hotkeys: [{ modifiers: ["Mod","Shift"], key: "K" } ]    
		        });
		        _this.addCommand({
		            id: 'del-space',
		            name: '去除末尾空格',
		            callback: function() { _this.去除末尾空格(); },
		            hotkeys: [{ modifiers: ["Mod","Alt"], key: "K" } ]
		        });
                _this.addCommand({
		            id: 'add-allSpspace',
		            name: '添加中英间隔',
		            callback: function() { _this.添加中英间隔(); }
		        });
                _this.addCommand({
		            id: 'del-allSpspace',
		            name: '去除所有空格',
		            callback: function() { _this.去除所有空格(); }
		        });

                _this.addSettingTab(new SettingsTab(_this.app, _this));
		        _this.loadSettings();
                return [2];
             });
        });
    };
    MyPlugin.prototype.onunload = function () {
        console.log('卸载插件');
    };
    MyPlugin.prototype.saveSettings = function () {
        var _this = this;
        var settings = _this.settings.toJson();
        _this.app.vault.adapter.write(_this.SETTINGS_PATH, settings);
    };
    MyPlugin.prototype.loadSettings = function () {
    	console.log("加载插件");
        var _this = this;
        _this.app.vault.adapter.read(_this.SETTINGS_PATH).
            then(function (content) { return _this.settings.fromJson(content); }).
            catch(function (error) { console.log("未找到设置文件。"); });
    };

    MyPlugin.prototype.获取相对路径 = function () {
        var activeFile = this.app.workspace.getActiveFile();
        var noteFilePath = activeFile.path;
        navigator.clipboard.writeText(noteFilePath)
        new obsidian.Notice("已获取当前笔记的相对路径！");
    };

    MyPlugin.prototype.转换内链语法 = function() {
    	var _defaultChar = this.settings.defaultChar;
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        if (!lines) {
        	this.替换所选文本 (this.获取编辑模式 (), "[[");
        	return;
        }
        var link = /[\"\|\[\]?\\\*\<\>\/:]/g;	//是否包含[]()及标点符号
        var link0 = /\[\[|\]\]/g;
        var link1 = /^([^\[\]]*)!\[+([^\[\]]*)$|^([^\[\]]*)\[+([^\[\]]*)$|^([^\[\]]*)\]+([^\[\]]*)$/g;	//是否只包含一侧的[[或]]
  		var link2 = /^[^\[\]]*(\[\[[^\[\]\.]*\]\][^\[\]]*)+$/g;	//是否包含N组成对的内链语法
  		var link4 = /([^\[\]\(\)\r\n]*)(\n*)(http.*)/mg;	//是否包含 说明文本&网址
	  	var link5 = /\[([^\[\]\r\n]*)(\n*)\]\((http[^\(\)]*)\)/mg;	//是否包含 [说明文本](网址)
  		var link8 = eval("/(["+_defaultChar+"])/g");
	  	if (link.test(lines)) {
	  		if (link1.test(lines)){
	  			return;
	  		}else if (link2.test(lines)){
	  			lines = lines.replace(link0,"");
	  		}else if(link5.test(lines)){
	  			lines = lines.replace(link5,"$1$3");
	  		}else if(link4.test(lines)){
	  			lines = lines.replace(link4,"[$1]($3)");
	  			lines = lines.replace("[\r\n]","")
	  		}
		}else{
			if (link8.test(lines)){
				lines = lines.replace(link8, "]]$1[[");
			}
			lines = "[[" + lines + "]]";
		}
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.标题语法 = function(_str) {
        var link = eval("/^"+_str+" ([^#]+)/mg");	//是否包含几个#符号
        var mdView = this.app.workspace.activeLeaf.view;
        if (mdView.sourceMode == undefined)
            return false;
        var editor = mdView.sourceMode.cmEditor;
        var doc = editor.getDoc();
        var cursorline = editor.getCursor().line;
        var line0 = editor.getLine(cursorline);

        if (link.test(line0)){
            var line1 = line0.replace(link,"$1");
        }else{
            var line1 = line0.replace(/^#+[ ]+/m,"");
            line1 = line1.replace(/^/m,_str+" ");
        }
        //new obsidian.Notice(line1);
        if(line1.length>line0.length){
            doc.replaceRange(line1, {line:cursorline,ch:0},{line:cursorline,ch:line1.length});
        }else{
            doc.replaceRange(line1, {line:cursorline,ch:0},{line:cursorline,ch:line0.length});
        }
    };
    
    MyPlugin.prototype.转换高亮语法 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /==[^=]*==/;	//是否包含高亮符号
        var link1 = /^[^=]*==[^=]*$/;	//是否只包含一侧的==

        if (link1.test(lines)){
            //new obsidian.Notice("只有一侧出现==符号");
            return;
        }else if (link.test(lines)){
            //new obsidian.Notice("成对出现==符号");
            lines = lines.replace(/==/g,"");
        }else{
            lines = lines.replace(/^(.*)$/mg,"==$1==");
            //lines = lines.replace(/^==\s*==$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
        var cmEditor = this.获取编辑模式 ();
        cmEditor.execCommand('goCharLeft');
        cmEditor.execCommand('goCharLeft');
    };
    
    MyPlugin.prototype.转换行内代码 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /`[^`]*`/;	//是否包含代码行符号
        var link1 = /^[^`]*`[^`]*$/;	//是否只包含一侧的`

        if (link1.test(lines)){
            //new obsidian.Notice("只有一侧出现`符号");
            return;
        }else if (link.test(lines)){
            //new obsidian.Notice("成对出现`符号");
            lines = lines.replace(/`/g,"");
        }else{
            //new obsidian.Notice("需要补充`符号");
            lines = lines.replace(/^(.*)$/mg,"`$1`");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.转换代码块 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /```[^`]+```/;	//是否包含代码行符号
        var link1 = /^[^`]*```[^`]*$/m;	//是否只包含一侧的`

        lines = lines.replace(/\n/g,"↫");
        if (link1.test(lines)){
            //new obsidian.Notice("只有一侧出现```符号");
            return;
        }else if (link.test(lines)){
            //new obsidian.Notice("成对出现```符号");
            lines = lines.replace(/```↫|↫```/g,"");
        }else{
            //new obsidian.Notice("需要补充```符号");
            lines = lines.replace(/^(.*)$/m,"```↫$1↫```");
        }
        lines = lines.replace(/↫/g,"\n");
        this.替换所选文本 (this.获取编辑模式 (), lines);
        var cmEditor = this.获取编辑模式 ();
        cmEditor.execCommand('goLineUp');
        cmEditor.execCommand('goLineEnd');
    };

    MyPlugin.prototype.转换上标 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /\<sup\>[^\<\>]*\<\/sup\>/g;	//是否包含<sup>下标</sup>
        var link1 = /\<sup\>[^\<\>\/]*$|^[^\<\>]*\<\/sup\>/g;	//是否只包含一侧的<sup>下标</sup>

        if (link1.test(lines)){
            //new obsidian.Notice("只有一侧出现<sup>下标</sup>符号");
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/(\<sup\>|\<\/sup\>)/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"\<sup\>$1\<\/sup\>");
            lines = lines.replace(/^\<sup\>\s*\<\/sup\>$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.转换下标 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /\<sub\>[^\<\>]*\<\/sub\>/g;	//是否包含<sub>下标</sub>
        var link1 = /\<sub\>[^\<\>\/]*$|^[^\<\>]*\<\/sub\>/g;	//是否只包含一侧的<sub>下标</sub>

        if (link1.test(lines)){
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/(\<sub\>|\<\/sub\>)/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"\<sub\>$1\<\/sub\>");
            lines = lines.replace(/^\<sub\>\s*\<\/sub\>$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.括选文本1 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /.*【[^【】]+】.*/g;	//是否包含【】
        var link1 = /【[^【】]*$|^[^【】]*】/g;	//是否只包含一侧的【】

        if (link1.test(lines)){
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/[【】]/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"【$1】");
            lines = lines.replace(/^【\s*】$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.括选文本2 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /.*（[^（）]*）.*/g;	//是否包含【】
        var link1 = /（[^（）]*$|^[^（）]*）/g;	//是否只包含一侧的【】

        if (link1.test(lines)){
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/[（）]/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"($1)");
            lines = lines.replace(/^(\s*)$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.括选文本3 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /.*「[^「」]*」.*/g;	//是否包含「」
        var link1 = /「[^「」]*$|^[^「」]*」/g;	//是否只包含一侧的「

        if (link1.test(lines)){
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/[「」]/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"「$1」");
            lines = lines.replace(/^「\s*」$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.括选文本4 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());
        var link = /.*《[^《》]*》.*/;	//是否包含《》
        var link1 = /《[^《》]*$|^[^《》]*》/;	//是否只包含一侧的《

        if (link1.test(lines)){
            return;
        }else if (link.test(lines)){
            lines = lines.replace(/[《》]/g,"");
        }else{
            lines = lines.replace(/^(.+)$/mg,"《$1》");
            lines = lines.replace(/^《\s*》$/mg,"");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };


    MyPlugin.prototype.转换有序列表 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());

        var link = /^[0-9]\.\s.*/;	//是否包含有序符号
        var link1 = /(^[0-9]\.\s)(?=[^\s])/mg;	//选中n. 前缀
        var link2 = /(^[\-\+]\s)(?=[^\s])/mg;	//选中-. 前缀

        if (link.test(lines)){
            //new obsidian.Notice("包含有序符号");
            lines = lines.replace(link1,"");
        }else{
            //new obsidian.Notice("需要补充有序符号");
            lines = lines.replace(link2,"");
            lines = lines.replace(/^(?=[^\n\r])/mg,"1. ");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.转换无序列表 = function() {
        var lines = this.获取所选文本 (this.获取编辑模式 ());

        var link = /^[\-\+]\s.*/;	//是否包含无序符号
        var link1 = /(^[0-9]\.\s)(?=[^\s])/mg;	//选中n. 前缀
        var link2 = /(^[\-\+]\s)(?=[^\s])/mg;	//选中-. 前缀

        if (link.test(lines)){
            //new obsidian.Notice("包含有序符号");
            lines = lines.replace(link2,"");
        }else{
            //new obsidian.Notice("需要补充有序符号");
            lines = lines.replace(link1,"");
            lines = lines.replace(/^(?=[^\n\r])/mg,"- ");
        }
        this.替换所选文本 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.粘贴表格 = function() {
    	let leaf = this.app.workspace.activeLeaf;
    	var xlsText = ""
    	var 分隔行 = ""
        const mdView = leaf.view;
        //获取 当前窗口  //其中const是【常数】
        if (mdView.sourceMode == undefined)
            return false;
        const doc = mdView.sourceMode.cmEditor;
        //获取 编辑模式
        let editor = doc;
        var selection = editor.getSelection();
        navigator.clipboard.readText()
		.then(xlsText => {
			xlsText = xlsText.replace(/\n/g,"■");
			xlsText = xlsText.replace(/\"([^■\|\"]+)■([^\|\n\"]+)\"/g,"$1<br>$2");
			分隔行 = xlsText.replace(/■.*/g,"");
			//new obsidian.Notice("分隔行　"+ 分隔行);
			分隔行 = 分隔行.replace(/\t/g,"|");
			分隔行 = 分隔行.replace(/([^\|]*)/g,"--");
			xlsText = xlsText.replace(/\t/g,"\|");
			xlsText = xlsText.replace(/^([^■]+)/,"$1■"+分隔行);
			xlsText = xlsText.replace(/■/g,"\n");
            xlsText = xlsText.replace(/^\|/mg,"　\|");
            xlsText = xlsText.replace(/\|$/mg,"\|　");
            xlsText = xlsText.replace(/^(?=[^\r\n])|(?<=[^\r\n])$/mg,"\|");
            xlsText = xlsText.replace(/(?<=\|)(?=\|)/g,"　");
			//navigator.clipboard.writeText(xlsText)
			editor.replaceSelection(xlsText);
			//将当前光标位置替换为处理后的md语法表格数据
			mdView.setMode(mdView.previewMode)
		})
		.catch(err => {
			console.error('Failed to read clipboard contents: ', err);
		});
    }
    
    MyPlugin.prototype.获取标注文本 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        //new obsidian.Notice(lines);
        var tmp = lines.replace(/^(?!#+ |#注释|#标注|#批注|#反思|#备注|.*==|.*%%).*$|^[^#\n%=]*(==|%%)|(==|%%)[^\n%=]*$|(==|%%)[^\n%=]*(==|%%)/mg,"\n");
        // ^(?!(==|%%).*$|
        //(注释|标注|批注|反思|备注)
        //|[^%=]*)
        tmp = tmp.replace(/[\r\n|\n]+/g,"\n")
        
        new obsidian.Notice("已成功获取，请粘贴！");
        navigator.clipboard.writeText(tmp);
    };

    MyPlugin.prototype.获取无语法文本 = function() {
        //this.指定编辑模式();
        var selection = this.获取所选文本 (this.获取编辑模式 ());
        var mdText = /(^#+\s|(?<=^|\s*)#|^>|^\- \[( |x)\]|^\+ |<[^<>]+>|^1\. |^\-+$|^\*+$|==|\*+|~~|```|!*\[\[|\]\])/mg;
        if(selection == ""){
            new obsidian.Notice("请先划选部分文本，再执行命令！");
        }else{
            selection = selection.replace(/\[([^\[\]]*)\]\([^\(\)]+\)/img,"$1");
            selection = selection.replace(mdText,"");
            selection = selection.replace(/^[ ]+|[ ]+$/mg,"");
            selection = selection.replace(/(\r\n|\n)+/mg,"\n");
            new obsidian.Notice("无语法文本 已成功获取，请粘贴！");
            navigator.clipboard.writeText(selection);
        }
    };

    MyPlugin.prototype.获取时间信息 = function() {
        var mdView = this.app.workspace.activeLeaf.view;
        if (mdView.sourceMode == undefined)
            return false;
        var editor = mdView.sourceMode.cmEditor;
        var markdownText = mdView.data;
        //获取 文档正文
        var cursorPosition = editor.getCursor();
        //获取 当前光标位置
        var lineText = editor.getLine(cursorPosition.line);
        //获取 光标所有行的文本
        //new obsidian.Notice(lineText);
        var shi = lineText.match(/\d\d(?=:\d\d:\d+\.\d\d\d)/);
        var fen = lineText.match(/\d\d(?=:\d\d\.\d\d\d|:\d\d\s)/);
        var miao = lineText.match(/\d\d(?=\.\d\d\d|\s)/);
        //new obsidian.Notice(shi);
        //new obsidian.Notice(fen);
        //new obsidian.Notice(miao);
        if(shi == null){shi="0"};
        if(fen == null){fen ="0"};
        if(miao == null){miao = "0"};
        var _time = Number(shi)*3600+Number(fen)*60+Number(miao);
        //new obsidian.Notice(_time);

        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        var _mdName = lines.match(/(?<=视频页面\[\[)[^\[\]]+(?=\]\])/)
        //new obsidian.Notice(_mdName);

        var 文件名列表 = this.app.vault.getMarkdownFiles().map(
    		function (_tmpFiles) {
    			//new obsidian.Notice("路径　"+_tmpFiles.path);
    			return _tmpFiles.path;
    	});
        //new obsidian.Notice(文件名列表);
        var _mdPath = 文件名列表.find(checkAdult);
        //new obsidian.Notice(_mdPath);
        //return _mdPath

        function checkAdult(age) {
            return age.includes(_mdName)
        }

        var _mdPathA = this.app.vault.getAbstractFileByPath(_mdPath)
        var _mdText = this.app.vault.read(_mdPathA)
        _mdText.then((value) => {
            var oldValue = value.replace(/&t=\d+/,"&t=0")
            value = value.replace(/&t=\d+/,"&t="+_time)
            //new obsidian.Notice(value);
            this.app.vault.modify(_mdPathA,oldValue)
            this.app.vault.modify(_mdPathA,value)
        });

    }
    
    MyPlugin.prototype.批量插入空行 = function() {
		var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/([^\n])\n([^\n])/g,"$1\n\n$2");
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };
    
    MyPlugin.prototype.批量去除空行 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/(\r\n|\n)[\t\s]*(\r\n|\n)/g,"\n");
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.末尾追加空格 = function() {
		var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/([^\s\n])\n/g,"$1  \n");
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };
    
    MyPlugin.prototype.去除末尾空格 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/\s\s\n/g,"\n")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };
    
    MyPlugin.prototype.添加中英间隔 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/([a-zA-Z]+)([一-鿆]+)/g,"$1 $2")
        lines = lines.replace(/([一-鿆]+)([a-zA-Z]+)/g,"$1 $2")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.去除所有空格 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/[ 　]+/g,"")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.搜索当前文本 = function() {
        var activeFile = this.app.workspace.getActiveFile();
        var noteFilename = activeFile.name;
        new obsidian.Notice(noteFilePath);
        noteFilename = noteFilename.replace(/\.md$/,"")
        var view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        var _txt = view.getSelection();
        _txt = _txt.replace(/^/,"path:"+noteFilename+" /")
        this.app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch(_txt)
    };

    MyPlugin.prototype.修复意外断行 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/([^。？！\.\?\!])[\r\n]*\n([^\.\?\!。？！])/g,"$1$2")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.修复错误语法 = function() {
        this.指定编辑模式 ();
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/【([^\[\]【】]*)】[（|\(]([^\(\)（）]*)[）|\)]/g,"\[$1\]\($2\)");
        //将 【】（）或【】() 转换为[]()
        lines = lines.replace(/\[\[([^\[\]]*)\]\]\(/g,"\[$1\](");
        //处理 bookXnote 回链语法，将 [[链接]]() 转换为 []()
        lines = lines.replace(/(?<=^|\s)    /mg,"\t");
        //把 四个空格转换为 制表符
        lines = lines.replace(/\*\s+\>\s+/g,"- ");
        //处理 bookXnote 回链语法中的列表
        lines = lines.replace(/(?<=\s)[0-9]+。 /g,"1. ");
        //把 1。 转换为 有序列表样式
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.英转中文标点 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/,/g,"，")
        lines = lines.replace(/(?<=[^0-9])\./g,"。")
        lines = lines.replace(/\?/g,"？")
        lines = lines.replace(/!/g,"！")
        lines = lines.replace(/;/g,"；")
        lines = lines.replace(/:/g,"：")
        lines = lines.replace(/\{([^{}]*)\}/g,"｛$1｝")
        lines = lines.replace(/\"([^\"]*?)\"/g,"“$1”")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.中转英文标点 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        lines = lines.replace(/，/g,",")
        lines = lines.replace(/。/g,"\.")
        lines = lines.replace(/？/g,"\?")
        lines = lines.replace(/！/g,"!")
        lines = lines.replace(/；/g,";")
        lines = lines.replace(/：/g,":")
        lines = lines.replace(/｛([^｛｝]*)｝/g,"{$1}")
        lines = lines.replace(/“([^“”]*)”/g,"\"$1\"")
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    };

    MyPlugin.prototype.转换路径 = function() {
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        var link1 = /^[a-zA-Z]:\\/;	//符合普通路径格式
        var link2 = /^(\[[^\[\]]*\]\()*file:\/\/\/[^\(\)]*\)*/;	//符合[](file路径)格式
        var link3 = /^\[[^\[\]]*\]\(([a-zA-Z]:\\[^\(\)]*)\)*/;	//意外路径格式
        if (link1.test(lines)){
            lines = lines.replace(/\s/mg,"%20");
            lines = lines.replace(/^(.*)$/m,"\[file\]\(file:///$1\)");
            lines = lines.replace(/\\/img,"\/");
            this.替换笔记全文 (this.获取编辑模式 (), lines);
        }else if(link2.test(lines)){
            lines = lines.replace(/%20/mg," ");
            lines = lines.replace(/^(\[[^\[\]]*\]\()*file:\/\/\/([^\(\)]*)\)*/m,"$2");
            lines = lines.replace(/\//mg,"\\");
            this.替换笔记全文 (this.获取编辑模式 (), lines);
        }else if(link3.test(lines)){
            lines = lines.replace(/^\[[^\[\]]*\]\(([a-zA-Z]:\\[^\(\)]*)\)*/m,"$1");
            this.替换笔记全文 (this.获取编辑模式 (), lines);
        }else{
            new obsidian.Notice("您划选的路径格式不正确！");
            return
        }
    };

    MyPlugin.prototype.简体转繁 = function(){
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        var _list1 = this.settings.简体字表;
        var _list2 = this.settings.繁体字表;
        
        for (var i=0;i<_list1.length;i++)
        { 
            lines = lines.replace(eval("/"+_list1[i]+"/g"),_list2[i]);
        }
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    }

    MyPlugin.prototype.繁体转简 = function(){
        var lines = this.获取笔记全文 (this.获取编辑模式 ());
        if (!lines) return;
        var _list1 = this.settings.简体字表;
        var _list2 = this.settings.繁体字表;
        
        for (var i=0;i<_list1.length;i++)
        { 
            lines = lines.replace(eval("/"+_list2[i]+"/g"),_list1[i]);
        }
        this.替换笔记全文 (this.获取编辑模式 (), lines);
    }

    MyPlugin.prototype.获取所选文本 = function(editor) {
        if (!editor) return;
        var editor = this.app.workspace.activeLeaf.view.sourceMode.cmEditor;
        var selection = editor.getSelection();
       	return selection;
    };

    MyPlugin.prototype.获取笔记全文 = function(editor) {
    	if (!editor) return;
        var selection = editor.getSelection();
        if (selection != "") {
       		return selection;
        } else {
            return editor.getValue();         
        }
    };

    MyPlugin.prototype.替换所选文本 = function(editor, lines) {
        var selection = editor.getSelection();
        editor.replaceSelection(lines);
    };

    MyPlugin.prototype.替换笔记全文 = function(editor, lines) {
	    var selection = editor.getSelection();
        if (selection != "") {
            editor.replaceSelection(lines);
        } else {
            editor.setValue(lines);
        }
    };

    MyPlugin.prototype.获取编辑模式 = function () {
        var view = this.app.workspace.activeLeaf.view;
        if (view.getViewType() == 'markdown') {
            var markdownView = view;
            var cmEditor = markdownView.sourceMode.cmEditor;
            return cmEditor;
        }
        return null;
    };

    MyPlugin.prototype.指定编辑模式 = function () {
		var view = this.app.workspace.activeLeaf.view;
		view.setMode(view.sourceMode)
		view.setEphemeralState({ focus: !0 });
		//指定编辑模式，并将焦点切换到当前笔记面板
    };

    return MyPlugin;
}(obsidian.Plugin));

var SettingsTab = /** @class */ (function (_super) {
    __extends(SettingsTab, _super);
    function SettingsTab(app, plugin) {
        var _this = _super.call(this, app, plugin) || this;
        _this.plugin = plugin;
        _this.settings = plugin.settings;
        return _this;
    }
    SettingsTab.prototype.display = function () {
        var _this = this;
        var containerEl = this.containerEl;
        containerEl.empty();
        containerEl.createEl('h2', { text: '增强编辑 0.2.8' });
        new obsidian.Setting(containerEl)
            .setName('【转换内链语法　　Alt+Z】　在选文两端添加或去除 [[链接]] 符号')
            .setDesc('　转换多个标题文本时的分隔符号，默认为换行符、顿号等。')
            .addText(function (text) {
            return text
                .setPlaceholder('禁用 "|[]?\*<>/: 等符号')
                .setValue(_this.settings.defaultChar)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _this.settings.defaultChar = value;
                            return [4 , _this.plugin.saveSettings()];   //保存缓存数据，取消
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); });
        }); 

        new obsidian.Setting(containerEl)
            .setName('增强编辑模式中的【功能　　快捷键】　说明......')
        var div = containerEl.createEl('p', {
            cls: 'recent-files-donation',
        });
        var donateText = document.createDocumentFragment();
        donateText.appendText('【转换内链语法　　Alt+Z】　在所选文本两端添加或去除 [[链接]] 符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换标题语法　　Ctrl+ 1-6】　指定或取消当前行文本为N级标题');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换高亮语法　　Alt+G】　在选文两端添加或去除 ==高亮== 符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换行内代码　　Alt+`】　在选文两端添加或去除 `行内代码` 符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换代码块　　Ctrl+Shift+M】　在选文两端添加或去除 ```代码块```符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换上标】　在选文两端添加或去除 <sup>上标</sup> 语法');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换下标】　在选文两端添加或去除 <sub>下标</sub> 语法');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【选文】　在选文两端添加或去除 【】符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('（选文）　在选文两端添加或去除 （）符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('「选文」　在选文两端添加或去除 「」符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('《选文》　在选文两端添加或去除 《》符号');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【英转中文标点　　Ctrl+Shift+Alt+Z】　将笔记中的英文标点转换为中文标点，如,.?!"等');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【中转英文标点　　Ctrl+Shift+Alt+Y】　将笔记中的中文标点转换为英文标点，如，。？！“等');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【转换路径语法　　Shift+Alt+F】　将 c:\\windows 与 [](file:///c:\/windows) 路径语法相互转换');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【简体转为繁体】　将笔记中的简体汉字转换为繁体汉字');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【繁体转为简体】　将笔记中的繁体汉字转换为简体汉字');
        donateText.appendChild(document.createElement('br'));
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【粘贴MD表格　　Ctrl+Alt+V】　将复制的Office表格直接粘贴为MarkDown语法表格');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【修复错误语法　　Ctrl+Shift+J】　修复笔记中的错误MD语法，如1。列表、【】（）链接、[[]]()回链等');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【修复意外断行　　Ctrl+Alt+D】　修复笔记中的意外断行（删除结尾不是句、问、叹号等标点的换行符）');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【搜索当前文本】　通过搜索面板在当前文档中搜索划选内容。');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【获取时间信息　　Ctrl+Shift+T】　获取当前行中的时间信息，并控制链接笔记中的视频进行跳转播放');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【获取标注文本　　Ctrl+Shift+B】　获取标题、高亮、注释及段落前缀（#标注、批注、反思、备注）等文本内容');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【获取无语法文本　　Ctrl+Alt+C】　获取去除markdown语法字符后的选文');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【获取相对路径】　获取当前笔记在库目录内的相对路径。');
        donateText.appendChild(document.createElement('br'));
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【批量插入空行　　Ctrl+Shift+L】　在划选的文本行或全文中间批量插入空白行');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【批量去除空行　　Ctrl+Alt+L】　批量去除划选文本或全文中的空白行');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【末尾追加空格　　Ctrl+Shift+K】　在每个文本行的末尾追加两个空格，以在预览模式时具有换行效果');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【去除末尾空格　　Ctrl+Alt+K】　批量去除每个文本行末尾的空格字符');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【添加中英间隔】　在正文的汉字与字母之间批量添加空格，如 china 中国。');
        donateText.appendChild(document.createElement('br'));
        donateText.appendText('【去除所有空格】　去除正文中所有的全、半角空格');
        div.appendChild(donateText);
    };
    return SettingsTab;
}(obsidian.PluginSettingTab));

module.exports = MyPlugin;