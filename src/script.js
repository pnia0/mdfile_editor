const test_text = '\n# fandation of podman\nリポジトリからコンテナをプルし、実行。\nリポジトリやsystemdからコンテナの自動起動と管理を行える。\n<img width="300px" src="./materials/podman-pod-image.png"><br>\n\n## related software\n- Buildah: ゼロから、あるいはイメージからコンテナを構築\n- Skepeo: 様々な環境間でのコンテナイメージのコピー\n- runC: OCIランタイム。イメージのビルドと実行、Docker形式のイメージの実行\n- CRI-O: Kubernetesとの連携\n\n## podman with cubernetes\npodmanではkubernetesYAMLの読み込みや、実行中のpodからの書き出しに対応している。\n読み込み: `podman kube play "pod.yaml"`\n書き出し: `podman generate kube -f path target_pod`\n\n# installation\n[about installation](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md)\n`podman machine init`\n\n# operate podman\nstart podman: `podman machine start`\nstop podman: `podman machine stop`\nchange to rootful: `podman machine set --rootful`\nchange to rootless: `podman machine set --rootless`(たぶん)\nlist podman machine(s): `podman machine ls`\n`podman system connection list`\nremove a machine: `podman machine rm "Option<machine_name>"`\n\n## container\nstart container: `podman run --name "container_name" "image_name"`\nstop container: `podman stop "container_name"`\nremove container: `podman rm "container_name"`\nlist running container: `podman ps`\nlist any containers: `podman ps -a`\n## image\npull image: `podman pull "image_name"`\nremove image: `podman rmi "image_id"`\nlist images: `podman images`\n## pod\nmake new pod: `podman pod create -p 8080:80 --name "pod_name"`\n### start pod:\n`podman run "pod_name"`\nport_forwarding: `podman run --rm -d -p 8080:80 "pod_name"`\nvolume_mounting: `podman run --rm -v PATH_on_windows:targetPATH_on_pod`\nstop pod: `podman pod stop "pod_name"`\nremove pod: `podman pod rm "pod_name"`\npod一覧表示: `podman pod ls`\n`podman pod ps`\nshow pod state: `podman pod top "pod_name"`\nshow pod state in detail: `podman pod inspect "pod_name"`\n## manage container in pod\nstart container: `podman run -dt --pod "pod_name" --name "container_name" "image_name"`\n# macvlan: podman netwark\n';
const LINE_NUMBER_OFFSET = "60px";
const TEXT_AREA_OFFSET = "0.5em";

class Editor {
    #buffer
    #view
    constructor(editor){
        this.#buffer = new Buffer;
        this.#view = new View(editor);
    }
    load_text(text){
        this.#view.updateView(this.#buffer.init(text));
    }
    arrowDown(){
        if (!this.#buffer.isDown()) {return;}
        this.#view.updateView(this.#buffer.arrowDown());
        //this.#view.arrowDown(this.#buffer.outputCursor());
        //this.#view.updateCursor(this.#buffer.arrowDown());
    }
    arrowUp(){
        if (!this.#buffer.isUp()) {return;}
        this.#view.updateView(this.#buffer.arrowUp());
        //this.#view.arrowUp(this.#buffer.outputCursor());
        //this.#view.updateCursor(this.#buffer.arrowUp());
    }
    arrowRight(){
        this.#view.updateView(this.#buffer.arrowRight());
    }
    arrowLeft(){
        this.#view.updateView(this.#buffer.arrowLeft());
    }
    outputText(){
        return this.#buffer.outputText();
    }
    
}

class Buffer {
    #headBuffer = "";
    #lineNumber = 0;
    #cursor;
    #bottomBuffer = "";
    constructor(){
        this.#cursor = new cursorLine;
    }
    init(text){
        let firstLineBottom = this.picFirstLine(text);
        this.#cursor.init(text.substring(0, firstLineBottom+1), 0);
        this.#bottomBuffer = text.substring(firstLineBottom + 1);
        return this.outputView();
    }
    outputCursor(){
        return this.#cursor.outputCursor();
    }
    outputText(){
        return this.#headBuffer + this.#cursor.outputText() + this.#bottomBuffer;
    }
    picFirstLine(text){
        let length = text.length;
        for(let count = 0;count < length;count++) {
            if (text.substring(count, count + 1) == "\n") {
                return count;
            }
        }
    }
    picLastLine(text){
        let count = text.length;
            while (0 <= count) {
            if (text.substring(count - 1, count) == "\n") {
                count--;
                break;
            }
            count--;
        }
        while (0 <= count) {
            if (text.substring(count - 1, count) == "\n") {
                return count;
            }
            count--;
        }
    }
    isUp(){
        return "" != this.#headBuffer;
    }
    isDown(){
        return "" != this.#bottomBuffer;
    }
    clearHeadLine(){}
    clearBottomLine(){}
    arrowDown(){
        if (!this.isDown()) {return};
        //if (this.isUp()) {
        //    this.#headBuffer += "\n";
        //} else {
        //    if (this.#cursorLeft == "") {
        //        this.#headBuffer = "\n"
        //    }
        //}
        this.#headBuffer += this.#cursor.outputText();
        let firstLineBottom = this.picFirstLine(this.#bottomBuffer);
        this.#cursor.shift(this.#bottomBuffer.substring(0, firstLineBottom+1));
        if (firstLineBottom == this.#bottomBuffer.length){
            this.#bottomBuffer = "";
        } else {
            this.#bottomBuffer = this.#bottomBuffer.substring(firstLineBottom + 1);
        }
        this.#lineNumber++;
        test.innerHTML = this.outputText();
        return this.outputView();
    }
    arrowUp(){
        if (!this.isUp()) {return;}
        //if (this.isDown()){
        //    this.#bottomBuffer = this.#cursorLeft + this.#cursorCenter + this.#cursorRight + "\n" + this.#bottomBuffer;
        //} else {
            
        //}
        this.#bottomBuffer = this.#cursor.outputText() + this.#bottomBuffer;
        let lastLineHead = this.picLastLine(this.#headBuffer);
        this.#cursor.shift(this.#headBuffer.substring(lastLineHead));
        this.#headBuffer = this.#headBuffer.substring(0, lastLineHead);
        this.#lineNumber--;
        //if (this.#headBuffer != "") {this.#headBuffer += "/n";}
        return this.outputView();
    }
    arrowRight(){
        this.#cursor.arrowRight();
        return this.outputView();
    }
    arrowLeft(){
        this.#cursor.arrowLeft();
        return this.outputView();
    }
    outputView(){
        return {headBuffer: this.#headBuffer, lineNumber: this.#lineNumber, cursor: this.#cursor.outputView(), bottomBuffer: this.#bottomBuffer};
    }
}

class cursorLine {
    #LeftBuffer = "";
    #CenterBuffer = "";
    #RightBuffer = "";
    #offset = 0;
    constructor(){}
    init(line, offset){
        let length = line.length;
        if(length <= offset) {
            this.#offset = length - 1;
        } else {
            this.#offset = offset;
        }
    }
    shift(line){
        let length = line.length;
        if(length <= this.#offset) {
            this.#offset = length - 1;
        }
        this.#LeftBuffer = line.substring(0, this.#offset);
        this.#CenterBuffer = line.substring(this.#offset, this.#offset +1);
        this.#RightBuffer = line.substring(this.#offset + 1);
    }
    arrowRight(){
        if(this.#offset < (this.outputText().length - 1)){
            this.#offset++;
            this.shift(this.outputText());
            console.log("working!");
        }
    }
    arrowLeft(){
        if (this.#offset != 0){
            this.#offset--;
            this.shift(this.outputText());
        }
    }
    outputView(){
        if (this.#CenterBuffer == '\n') {
            return {left:this.#LeftBuffer, center: ' ', right: this.#RightBuffer};
        } else {
            return {left: this.#LeftBuffer, center: this.#CenterBuffer, right: this.#RightBuffer};
        }
    }
    outputText(){
        return (this.#LeftBuffer + this.#CenterBuffer + this.#RightBuffer);
    }
}

class View {
    #headView = "";
    #cursorLineViewArea = null;
    #cursorLineNumberView = "1";
    #cursorLineNumber = 1;
    #cursorLineView = "";
    #cursorLeft = "";
    #cursorCenter = "";
    #cursorRight = "";
    #bottomView = "";
    constructor(editor){
        editor.style.width = "100%";
        editor.style.display = "flex";
        editor.style.flexDirection = "column"
        this.#headView = document.createElement("div");
        this.#cursorLineViewArea = document.createElement("div");
        this.#cursorLineView = document.createElement("div");
        this.#cursorLineNumberView = document.createElement("div");
        this.#cursorLeft = document.createElement("div");
        this.#cursorCenter = document.createElement("div");
        this.#cursorRight = document.createElement("div");
        this.#bottomView = document.createElement("div");
        editor.appendChild(this.#headView);
        editor.appendChild(this.#cursorLineViewArea);
        editor.appendChild(this.#bottomView);
        this.#cursorLineViewArea.appendChild(this.#cursorLineNumberView);
        //this.#cursorLineViewArea.appendChild(this.#cursorLineView);
        this.#cursorLineViewArea.appendChild(this.#cursorLeft);
        this.#cursorLineViewArea.appendChild(this.#cursorCenter);
        this.#cursorLineViewArea.appendChild(this.#cursorRight);
        this.#cursorLineViewArea.style.display = "flex";
        this.#cursorLineViewArea.style.flexDirection = "row";
        this.#cursorLineViewArea.style.width = "100%";
        //this.#cursorLineView.overflowWrap = "anywhere";
        this.#cursorLineNumberView.style.width = LINE_NUMBER_OFFSET;
        this.#cursorLineNumberView.style.textAlign = "right";
        //this.#headView.style.whiteSpace = "pre-line";
        //this.#bottomView.style.whiteSpace = "pre-line";
        this.#headView.style.marginLeft = LINE_NUMBER_OFFSET;
        this.#bottomView.style.marginLeft = LINE_NUMBER_OFFSET;
        this.#headView.style.paddingLeft = TEXT_AREA_OFFSET;
        this.#cursorLeft.style.paddingLeft = TEXT_AREA_OFFSET;
        this.#bottomView.style.paddingLeft = TEXT_AREA_OFFSET;
        this.#headView.style.flexGrow ="1";
        this.#cursorLineView.style.flexGrow = "1";
        this.#bottomView.style.flexGrow ="1";
        this.#headView.style.border= "2px solid #ff0000";
        this.#cursorLineViewArea.style.border= "2px solid #ffff00";
        this.#bottomView.style.border= "2px solid #00ff00";
        this.#cursorCenter.style.backgroundColor= "#888888";
        this.#cursorLeft.style.whiteSpace = "break-spaces";
        this.#cursorCenter.style.whiteSpace = "break-spaces";
        this.#cursorRight.style.whiteSpace = "break-spaces";
        this.#cursorLineNumber = 1;
        this.#cursorLineNumberView.innerText = this.#cursorLineNumber;
    }
    init(text){
        let firstLineBottom = this.picFirstLine(text);

        this.#cursorLineView.innerText = text.substring(0, firstLineBottom);
        this.#bottomView.innerHTML = this.initInterprit(text.substring(firstLineBottom + 1));
    }
    initInterprit(text){
        if (text.substring(text.length - 1) == "\n") {text += "　"};
        return text;
    }
    interpritHead(headText){
        //if (headText.substring(headText.length - 1) == "\n") {headText += ""};
        if (headText == ""){return "";}
        return headText;//markdown.parse(headText);
    }
    interpritBottom(bottomText){
        if (bottomText.substring(bottomText.length - 1) == "\n") {bottomText += "　"};
        if (bottomText ==""){return "";}
        return bottomText;//markdown.parse(bottomText);
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
    clearHeadLine(text){}
    clearBottomLine(text){}
    arrowDown(line){
        if (!this.isDown()) {return;}
        if (this.isUp) {
            this.#headView.innerHTML = this.interpritHead(this.#headView.innerHTML + "\n" + line);
        } else {
            this.#headView.innerHTML = this.interpritHead(line);
        }
        let firstLineBottom = this.picFirstLine(this.#bottomView.innerHTML);
        this.#bottomView.innerHTML = this.#bottomView.innerHTML.substring(firstLineBottom + 1);
        this.#cursorLineNumber++;
        this.updateCursorLineNumber();
        return;
    }
    arrowUp(line){
        if (!this.isUp()) {return;}
        this.#bottomView.innerHTML = this.interpritBottom(line + "\n" + this.#bottomView.innerHTML);
        let lastLineHead = this.picLastLine(this.#headView.innerHTML);
        this.#headView.innerHTML = this.#headView.innerHTML.substring(0, lastLineHead - 1);
        this.#cursorLineNumber--;
        this.updateCursorLineNumber();
        return;
    }
    updateView(buffer){
        this.#headView.innerHTML = this.interpritHead(buffer.headBuffer);
        this.#cursorLineNumberView.innerText = buffer.lineNumber;
        this.#cursorLeft.innerText = buffer.cursor.left;
        this.#cursorCenter.innerText = buffer.cursor.center;
        this.#cursorRight.innerText = buffer.cursor.right;
        this.#bottomView.innerHTML = this.interpritBottom(buffer.bottomBuffer);
    }
    updateCursor(line){
        this.#cursorLineView.innerText = line;
    }
    updateCursorLineNumber(){
        this.#cursorLineNumberView.innerText = this.#cursorLineNumber;
    }
}

function editorInit(){
    return new Editor(document.getElementById("editor"));
}

async function saveFile(editor){
    let targetFile = await window.showOpenFilePicker({
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
    let writableStream = await targetFile.createWritable();
    await writableStream.write(editor.outputText + "written!\n");
    await writableStream.close();
}
async function openFile(editor){/*
    let targetFile = await window.showOpenFilePicker({
        types: [
            {
                description: '入力ファイル',
                accept: {
                    'text/plain': ['.md'],
                },
            },
        ],
        excludeAcceptAllOption: true,
    });*/
    let targetFile = await window.showOpenFilePicker(picker0pts);
    const reader = new FileReader();
    await reader.readAsText(targetFile.getFile().files[0]);
    editor.load_text(reader.result);
}
let test;
let state_s = false;
let state_o = false;
let currentFIle;
window.onload = async() => {
    await markdown.ready;
    let editor = editorInit();
    editor.load_text(test_text);
    test = document.createElement("div");
    document.getElementById("editor").appendChild(test);
    test.style.whiteSpace = "pre-line";
    test.innerText = editor.outputText();
    document.addEventListener("keydown", function(event){
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            editor.arrowDown();
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            editor.arrowUp();
        }
        if (event.key === 'ArrowRight'){
            event.preventDefault();
            editor.arrowRight();
        }
        if (event.key === 'ArrowLeft'){
            event.preventDefault();
            editor.arrowLeft();
        }
        if (event.ctrlKey && event.key === 's') {
            console.log(state_s);
            event.preventDefault();
            if (!state_s){
                state_s = true;
                saveFile(editor);
            }
        }
        if (event.ctrlKey && event.key == 'o') {
            event.preventDefault();
            if(!state_o){
                state_0 = true;
                openFile(editor);
            }
        }
    })
    document.addEventListener("keyup", function(event){
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




