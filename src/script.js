const test_text = '\n# fandation of podman\nリポジトリからコンテナをプルし、実行。\nリポジトリやsystemdからコンテナの自動起動と管理を行える。\n<img width="300px" src="./materials/podman-pod-image.png"><br>\n\n## related software\n- Buildah: ゼロから、あるいはイメージからコンテナを構築\n- Skepeo: 様々な環境間でのコンテナイメージのコピー\n- runC: OCIランタイム。イメージのビルドと実行、Docker形式のイメージの実行\n- CRI-O: Kubernetesとの連携\n\n## podman with cubernetes\npodmanではkubernetesYAMLの読み込みや、実行中のpodからの書き出しに対応している。\n読み込み: `podman kube play "pod.yaml"`\n書き出し: `podman generate kube -f path target_pod`\n\n# installation\n[about installation](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md)\n`podman machine init`\n\n# operate podman\nstart podman: `podman machine start`\nstop podman: `podman machine stop`\nchange to rootful: `podman machine set --rootful`\nchange to rootless: `podman machine set --rootless`(たぶん)\nlist podman machine(s): `podman machine ls`\n`podman system connection list`\nremove a machine: `podman machine rm "Option<machine_name>"`\n\n## container\nstart container: `podman run --name "container_name" "image_name"`\nstop container: `podman stop "container_name"`\nremove container: `podman rm "container_name"`\nlist running container: `podman ps`\nlist any containers: `podman ps -a`\n## image\npull image: `podman pull "image_name"`\nremove image: `podman rmi "image_id"`\nlist images: `podman images`\n## pod\nmake new pod: `podman pod create -p 8080:80 --name "pod_name"`\n### start pod:\n`podman run "pod_name"`\nport_forwarding: `podman run --rm -d -p 8080:80 "pod_name"`\nvolume_mounting: `podman run --rm -v PATH_on_windows:targetPATH_on_pod`\nstop pod: `podman pod stop "pod_name"`\nremove pod: `podman pod rm "pod_name"`\npod一覧表示: `podman pod ls`\n`podman pod ps`\nshow pod state: `podman pod top "pod_name"`\nshow pod state in detail: `podman pod inspect "pod_name"`\n## manage container in pod\nstart container: `podman run -dt --pod "pod_name" --name "container_name" "image_name"`\n# macvlan: podman netwark\n';
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
    init(text){
        let firstLineBottom = this.picFirstLine(text);
        this.#centerBuffer = text.substring(0, firstLineBottom);
        this.#isCenterenter = true;
        this.#bottomBuffer = text.substring(firstLineBottom + 1);
        return this.outputView();
    }
    outputCursor(){
        return {text: this.#centerBuffer, start: this.#cursor, end: this.#cursor, lineNumber: this.#lineNumber};
    }
    outputText(cursorCenter){
        return this.#headBuffer + this.#centerBuffer + this.#bottomBuffer;
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
        return "" != this.#bottomBuffer;
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
        if ( this.#centerBuffer.length < cursorInput.start) {
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
        test.innerHTML = this.outputText(cursorInput);
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
    outputView(){
        return {headBuffer: this.#headBuffer, centerBuffer: this.outputCursor(), bottomBuffer: this.#bottomBuffer};
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

        this.#headView.style.border= "2px solid #ff0000";
        this.#cursorLineViewArea.style.border= "2px solid #ffff00";
        this.#bottomView.style.border= "2px solid #00ff00";

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

function toolBarInit(area){
    let buttonOpen = document.createElement("input");
    buttonOpen.type = "button";
    buttonOpen.value = "Open";
    buttonOpen.classList = "headButton";
    buttonOpen.addEventListener("click", openFile);

    let buttonSave = document.createElement("input");
    buttonSave.type = "button";
    buttonSave.value = "Save";
    buttonSave.classList = "headButton";
    buttonSave.addEventListener("click", saveFile);

    let buttonNew = document.createElement("input");
    buttonNew.type = "button";
    buttonNew.value = "new";
    buttonNew.classList = "headButton";
    buttonNew.addEventListener("click", newFile);

    area.appendChild(buttonOpen);
    area.appendChild(buttonSave);
    area.appendChild(buttonNew);
}

async function saveFile(editor){
    if (!editor.targetFile){
        [editor.targetFile] = await window.showOpenFilePicker({
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
    await writableStream.write(editor.outputText() + "written!\n");
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

function newFile(){}
let test;
let state_s = false;
let state_o = false;
let currentFIle;
window.onload = async() => {
    let editor = editorInit();
    editor.load_text(test_text);
    test = document.createElement("div");
    document.getElementById("editor").appendChild(test);
    test.style.whiteSpace = "pre-line";
    test.innerText = editor.outputText();
    toolBarInit(document.getElementById("toolbar"));
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
