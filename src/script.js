//(C) 2025 pnia0 All Rights Reserved.
//This project is licensed under the MIT License.
//See the LICENSE file or https://opensource.org/licenses/mit-license.php for details.

const test_text = '\n# MDfile_editor\n---\nこのプログラムはmdファイルをプレビューしながら編集できるエディターです。\nまずは灰色のカーソル行をタップしてみましょう。\nカーソルを上下させるとカーソル行だけがプレーンテキストで表示されているとわかります。\n## features\n- 編集行はプレーンテキスト、それ以外はmdの***装飾***が適用されます。\n- ローカルファイルの編集に対応しています。\n- デザインにも気を使っています。\n## 使用ライブラリ\nMDファイルをHTMLに変換するインタープリタ"Marked.js"を利用しています。感謝。\n## 使用上の注意\n- 注意はしていますが、バグの可能性がゼロではありません。編集するデータは必要に応じてバックアップしておいてください。\n- 保存していない状態でOpen/NewFileすると編集データが飛びます。警告は未実装です。\n- 作者はこのプログラムの使用によって生じたいかなる損害も補償しません。あしからず。\n## 今後実装したい機能\n- グーグルドライブ上のファイルの編集\n- 複数ファイルの取り扱い\n- vim準拠の編集機能\n- 画像の読み込み※画像として認識はされますが、表示はされません。\n## .P.S\nMITライセンスで公開してみたので、自由に使用することができます。\nContributorを歓迎します。設計思想に共感してくださった方はぜひ。\n';
const LINE_NUMBER_OFFSET = "60px";
const TEXT_AREA_OFFSET = "0.5em";

class Editor {
    #buffer
    #view
    #target_file
    constructor(editor){
        this.#buffer = new Buffer;
        this.#view = new View(editor);
    }

    load_text(text){
        this.#view.updateView(this.#buffer.init(text));
    }

    arrowDown(){
        if (!this.#buffer.isDown()) {return;}
        this.#view.updateView(this.#buffer.arrowDown(this.#view.outputCursor()));
    }

    arrowUp(){
        if (!this.#buffer.isUp()) {return;}
        this.#view.updateView(this.#buffer.arrowUp(this.#view.outputCursor()));
    }

    enter(){
        this.#view.updateView(this.#buffer.enter(this.#view.outputCursor()));
    }

    backspace(event){
        if (this.#view.isLeftest()) {event.preventDefault();} else {return;}
        if (!this.#buffer.isUp()) {return;}
        this.#view.updateView(this.#buffer.backspace(this.#view.outputCursor()));
    }

    delete(event){
        if (this.#view.isRightest()) {event.preventDefault();} else {return;}
        if (!this.#buffer.isDown()) {return;}
        this.#view.updateView(this.#buffer.delete(this.#view.outputCursor()));
    }

    outputText(){
        return this.#buffer.outputText(this.#view.outputCursor());
    }
}

class Buffer {
    #headBuffer = "";
    #lineNumber = 1;
    #cursor = 0;
    #isCenterenter = false;
    #centerBuffer = "";
    #bottomBuffer = "";
    init(inText){
        let text = this.trimEnter(inText);
        let firstLineBottom = this.picFirstLine(text);
        this.#headBuffer = "";
        this.#centerBuffer = text.substring(0, firstLineBottom);
        this.#isCenterenter = true;
        this.#bottomBuffer = text.substring(firstLineBottom + 1);
        this.#lineNumber = 1;
        this.#cursor = 0;
        return this.outputView();
    }
    outputCursor(){
        return {text: this.#centerBuffer, start: this.#cursor, end: this.#cursor, lineNumber: this.#lineNumber};
    }
    outputView(){
        if(this.#bottomBuffer == "" && this.#isCenterenter) {
            return {headBuffer: this.#headBuffer, centerBuffer: this.outputCursor(), bottomBuffer: "\n"};
        }
        return {headBuffer: this.#headBuffer, centerBuffer: this.outputCursor(), bottomBuffer: this.#bottomBuffer};
    }
    outputText(cursorCenter){
        if (this.#isCenterenter) {
            return this.#headBuffer + cursorCenter.text + "\n" + this.#bottomBuffer;
        } else {
            return this.#headBuffer + cursorCenter.text + this.#bottomBuffer;
        }
    }
    picFirstLine(text){
        let length = text.length;
        for(let count = 0;count < length;count++) {
            if (text.substring(count, count + 1) == "\n") {
                return count;
            }
        }
        return length - 1;
    }
    picLastLine(text){
        let count = text.length;
        //行末の改行を検知
        while (0 < count) {
            if (text.substring(count - 1, count) == "\n") {
                count--;
                break;
            }
            count--;
        }
        //前の行の行末の改行を検知
        while (0 < count) {
            if (text.substring(count - 1, count) == "\n") {
                count--;
                return count;
            }
            count--;
        }
        count--;
        return count;
    }
    isUp(){
        return "" != this.#headBuffer;
    }
    isDown(){
        return "" != this.#bottomBuffer || this.#isCenterenter;
    }
    trimEnter(text){
        let count = 0;
        let length = text.length;
        let output = "";
        while (count <= length) {
            if (text.substring(count, count + 1) == "\r"){
                output += "\n";
                count++;
                if (text.substring(count, count + 1) == "\n") {count++;}
            } else {
                output += text.substring(count, count + 1);
                count++;
            }
        }
        return output;
    }
    arrowDown(cursorInput){
        if (!this.isDown()) {return};
        this.#headBuffer += cursorInput.text + "\n";
        let firstLineBottom = this.picFirstLine(this.#bottomBuffer);
        if(this.#bottomBuffer.substring(firstLineBottom, firstLineBottom +1) == "\n"){
            this.#centerBuffer = this.#bottomBuffer.substring(0, firstLineBottom);
            this.#isCenterenter = true;
            if(firstLineBottom == 0){
                this.#centerBuffer = "";
            }
        } else {
            this.#centerBuffer = this.#bottomBuffer.substring(0, firstLineBottom + 1);
            this.#isCenterenter = false;
            if(firstLineBottom == -1){
                this.#centerBuffer = "";
            }
        }
        //カーソル位置調整
        if (this.#centerBuffer.length < cursorInput.start) {
            this.#cursor = this.#centerBuffer.length - 1;
        } else {
            this.#cursor = cursorInput.start;
        }

        if (firstLineBottom == this.#bottomBuffer.length){
            this.#bottomBuffer = "";
        } else {
            this.#bottomBuffer = this.#bottomBuffer.substring(firstLineBottom + 1);
        }
        this.#lineNumber++;
        return this.outputView();
    }
    arrowUp(cursorInput){
        if (!this.isUp()) {return;}
        if (this.#lineNumber <= 1){return;}
        if (this.#isCenterenter){
            this.#bottomBuffer = cursorInput.text + "\n" + this.#bottomBuffer;
        } else {
            this.#bottomBuffer = cursorInput.text + this.#bottomBuffer;
        }
        let lastLineHead = this.picLastLine(this.#headBuffer);
        if (this.#headBuffer.length - 1 == lastLineHead) {
            this.#centerBuffer = "";
        } else {
            this.#centerBuffer = (this.#headBuffer.substring(lastLineHead + 1, this.#headBuffer.length - 1));
        }
        this.#isCenterenter = true;
        if ( this.#centerBuffer.length < cursorInput.start) {
            this.#cursor = this.#centerBuffer.length;
        } else {
            this.#cursor = cursorInput.start;
        }
        this.#headBuffer = this.#headBuffer.substring(0, lastLineHead + 1);
        this.#lineNumber--;
        return this.outputView();
    }
    enter(cursorInput){
        let cursorStart;
        cursorStart = cursorInput.text.length;
        while(0 <= cursorStart){
            cursorStart--;
            if(cursorInput.text.substring(cursorStart, cursorStart + 1) == "\n"){break;}
        }
        if(cursorStart < 0){return this.outputView();}
        this.#headBuffer += cursorInput.text.substring(0, cursorStart + 1);
        this.#centerBuffer = cursorInput.text.substring(cursorStart + 1);
        this.#lineNumber++;
        this.#cursor = 0;
        return this.outputView();
    }
    backspace(cursorInput){
        let lastLineHead = this.picLastLine(this.#headBuffer);
        if (this.#headBuffer.length - 1 == lastLineHead) {
            this.#centerBuffer = "";
        } else {
            this.#centerBuffer = (this.#headBuffer.substring(lastLineHead + 1, this.#headBuffer.length - 1));
        }
        this.#headBuffer = this.#headBuffer.substring(0, lastLineHead + 1);
        this.#cursor = this.#centerBuffer.length;
        this.#centerBuffer += cursorInput.text;
        this.#lineNumber--;
        return this.outputView();
    }
    delete(cursorInput){
        this.#cursor = cursorInput.start;
        let firstLineBottom = this.picFirstLine(this.#bottomBuffer);
        if(this.#bottomBuffer.substring(firstLineBottom, firstLineBottom + 1) == "\n"){
            if(firstLineBottom != 0) {
                this.#centerBuffer += this.#bottomBuffer.substring(0, firstLineBottom);
                this.#isCenterenter = true;
            }
        } else {
            if(firstLineBottom != -1) {
                this.#centerBuffer += this.#bottomBuffer.substring(0, firstLineBottom + 1);
                this.#isCenterenter = false;
            }
        }
        if(firstLineBottom == this.#bottomBuffer.length){
            this.#bottomBuffer = "";
        } else {
            this.#bottomBuffer = this.#bottomBuffer.substring(firstLineBottom + 1);
        }
        return this.outputView();
    }
}

class View {
    #headView = document.createElement("div");
    #cursorLineViewArea = document.createElement("div");
    #cursorLineNumberView = document.createElement("div");
    #cursorInput = document.createElement("textarea");
    #bottomView = document.createElement("div");
    #cursorLineNumber = 1;
    constructor(editor){
        editor.appendChild(this.#headView);
        editor.appendChild(this.#cursorLineViewArea);
        editor.appendChild(this.#bottomView);
        this.#cursorLineViewArea.appendChild(this.#cursorLineNumberView);
        this.#cursorLineViewArea.appendChild(this.#cursorInput);

        /*for debug
        this.#headView.style.border= "2px solid #ff0000";
        this.#cursorLineViewArea.style.border= "2px solid #ffff00";
        this.#bottomView.style.border= "2px solid #00ff00";
        */

        this.#cursorLineNumber = 1;
        this.updateCursorLineNumber();

        this.#headView.id = "headView";
        this.#cursorLineViewArea.id = "cursorLineArea";
        this.#cursorInput.id = "cursorInput";
        this.#cursorLineNumberView.id = "cursorLineNumber";
        this.#bottomView.id = "bottomView";
    }
    initInterprit(text){
        if (text.substring(text.length - 1) == "\n") {text += "　"};
        return text;
    }
    interpritHead(headText){
        if (headText.substring(0, 1) == "\n") {headText = "<br>\n\n" + headText.substring(1)};
        if (headText.substring(headText.length - 2, headText.length - 1) == "\n") {headText += "<br>";}
        if (headText == ""){return "";}
        return marked.parse(headText);
    }
    interpritBottom(bottomText){
        if (bottomText.substring(bottomText.length - 1) == "\n") {bottomText += "<br>";}
        if (bottomText ==""){return "";}
        return marked.parse(bottomText);
    }
    picFirstLine(text){
        let count = 0;
        while(1) {
            if (text.substring(count, count + 1) == "\n") {
                return count;
            }
            count++;
        }
    }
    picLastLine(text){
        let count = text.length;
        while(1) {
            if (text.substring(count - 1, count) == "\n") {
                return count;
            }
            count--;
        }
    }
    isUp(){
        return "" != this.#headView.innerHTML;
    }
    isDown(){
        return "" != this.#bottomView.innerHTML;
    }
    isLeftest(){
        return this.#cursorInput.selectionEnd == 0;
    }
    isRightest(){
        return this.#cursorInput.selectionStart == this.#cursorInput.value.length;
    }
    updateView(buffer){
        this.#headView.innerHTML = this.interpritHead(buffer.headBuffer);
        this.#cursorLineNumberView.innerText = buffer.centerBuffer.lineNumber;
        this.#cursorInput.value = buffer.centerBuffer.text;
        this.#cursorInput.setSelectionRange(buffer.centerBuffer.start, buffer.centerBuffer.end);
        this.#bottomView.innerHTML = this.interpritBottom(buffer.bottomBuffer);
    }
    updateCursorLineNumber(){
        this.#cursorLineNumberView.innerText = this.#cursorLineNumber;
    }
    outputCursor(){
        if (this.#cursorInput.value.length == 0){
            return {text: this.#cursorInput.value, start: this.#cursorInput.selectionStart, end: this.#cursorInput.selectionEnd};
        } else {
            return {text: this.#cursorInput.value, start: this.#cursorInput.selectionStart, end: this.#cursorInput.selectionEnd};
        }
    }
}

function editorInit(){
    return new Editor(document.getElementById("editor"));
}

function toolBarInit(editor, area){
    let buttonOpen = document.createElement("input");
    buttonOpen.type = "button";
    buttonOpen.value = "Open";
    buttonOpen.classList = "headButton";
    buttonOpen.addEventListener("click", function(){
        openFile(editor);
    });

    let buttonSave = document.createElement("input");
    buttonSave.type = "button";
    buttonSave.value = "Save";
    buttonSave.classList = "headButton";
    buttonSave.addEventListener("click", function(){
        saveFile(editor);
    });

    let buttonNew = document.createElement("input");
    buttonNew.type = "button";
    buttonNew.value = "new";
    buttonNew.classList = "headButton";
    buttonNew.addEventListener("click", function(){
        newFile(editor);
    });

    area.appendChild(buttonOpen);
    area.appendChild(buttonSave);
    area.appendChild(buttonNew);
}

async function saveFile(editor){
    if (!editor.targetFile){
        editor.targetFile = await window.showSaveFilePicker({
            types: [
                {
                    description: '保存先ファイル',
                    accept: {
                        'text/plain': ['.md'],
                    },
                },
            ],
            excludeAcceptAllOption: true,
        });
    }
    let writableStream = await editor.targetFile.createWritable();
    await writableStream.write(editor.outputText());
    await writableStream.close();
}

async function openFile(editor){
    let previousTarget = editor.targetFile;
    [editor.targetFile] = await window.showOpenFilePicker();
    if(previousTarget != editor.targetFile){
        const file = await editor.targetFile.getFile();
        editor.load_text(await file.text());
    }
}

function newFile(editor){
    editor.targetFile = null;
    editor.load_text("");
}

function phoneUIinit(editor) {
    let phoneUI = document.createElement("div");
    phoneUI.id = "phoneUI";

    let workspace = document.getElementById("workspace")
    workspace.appendChild(phoneUI);

    let upButton = document.createElement("input");
    upButton.classList.add("phoneUI-button");
    upButton.type = "button";
    upButton.addEventListener("click", function(){
        editor.arrowUp();
    });
    phoneUI.appendChild(upButton);

    let downButton = document.createElement("input");
    downButton.classList.add("phoneUI-button");
    downButton.type = "button";
    downButton.addEventListener("click", function(){
        editor.arrowDown();
    });
    phoneUI.appendChild(downButton);
}

let test;
let state_s = false;
let state_o = false;
let currentFIle;
window.onload = async() => {
    let editor = editorInit();
    editor.load_text(test_text);
    toolBarInit(editor, document.getElementById("toolbar"));
    phoneUIinit(editor);

    document.addEventListener("keydown", function(event){
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            editor.arrowDown();
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            editor.arrowUp();
        }
        if (event.key === 'Backspace') {
            editor.backspace(event);
        }
        if (event.key === 'Delete') {
            editor.delete(event);
        }
        /*
        if (event.key === 'ArrowRight'){
            event.preventDefault();
            editor.arrowRight();
        }
        if (event.key === 'ArrowLeft'){
            event.preventDefault();
            editor.arrowLeft();
        }
        */
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (!state_s){
                state_s = true;
                saveFile(editor);
            }
        }
        if (event.ctrlKey && event.key == 'o') {
            event.preventDefault();
            if(!state_o){
                state_o = true;
                openFile(editor);
            }
        }
    })
    document.addEventListener("keyup", function(event){
        if (event.key === 'Enter'){
            editor.enter();
        }
        if (event.key === 's') {
            event.preventDefault();
            state_s = false;
        }
        if (event.key === 'o') {
            event.preventDefault();
            state_o = false;
        }
    })
}
