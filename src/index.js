const test_text = '# fandation of <br>podman\nリポジトリからコンテナをプルし、実行。\nリポジトリやsystemdからコンテナの自動起動と管理を行える。\n<img width="300px" src="./materials/podman-pod-image.png"><br>\n\n## related software\n- Buildah: ゼロから、あるいはイメージからコンテナを構築\n- Skepeo: 様々な環境間でのコンテナイメージのコピー\n- runC: OCIランタイム。イメージのビルドと実行、Docker形式のイメージの実行\n- CRI-O: Kubernetesとの連携\n\n## podman with cubernetes\npodmanではkubernetesYAMLの読み込みや、実行中のpodからの書き出しに対応している。\n読み込み: `podman kube play "pod.yaml"`\n書き出し: `podman generate kube -f path target_pod`\n\n# installation\n[about installation](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md)\n`podman machine init`\n\n# operate podman\nstart podman: `podman machine start`\nstop podman: `podman machine stop`\nchange to rootful: `podman machine set --rootful`\nchange to rootless: `podman machine set --rootless`(たぶん)\nlist podman machine(s): `podman machine ls`\n`podman system connection list`\nremove a machine: `podman machine rm "Option<machine_name>"`\n\n## container\nstart container: `podman run --name "container_name" "image_name"`\nstop container: `podman stop "container_name"`\nremove container: `podman rm "container_name"`\nlist running container: `podman ps`\nlist any containers: `podman ps -a`\n## image\npull image: `podman pull "image_name"`\nremove image: `podman rmi "image_id"`\nlist images: `podman images`\n## pod\nmake new pod: `podman pod create -p 8080:80 --name "pod_name"`\n### start pod:\n`podman run "pod_name"`\nport_forwarding: `podman run --rm -d -p 8080:80 "pod_name"`\nvolume_mounting: `podman run --rm -v PATH_on_windows:targetPATH_on_pod`\nstop pod: `podman pod stop "pod_name"`\nremove pod: `podman pod rm "pod_name"`\npod一覧表示: `podman pod ls`\n`podman pod ps`\nshow pod state: `podman pod top "pod_name"`\nshow pod state in detail: `podman pod inspect "pod_name"`\n## manage container in pod\nstart container: `podman run -dt --pod "pod_name" --name "container_name" "image_name"`\n# macvlan: podman netwark\n';

class Editor {
    #buffer
    #view
    constructor(editor){
        this.#buffer = new Buffer;
        this.#view = new View(editor);
    }
    load_text(text){
        this.#buffer.init(text);
        this.#view.init(text);
    }
    arrowDown(){
        if (!this.#buffer.isDown()) {return;}
        this.#view.arrowDown(this.#buffer.outputCursor());
        this.#view.updateCursor(this.#buffer.arrowDown());
    }
    arrowUp(){
        if (!this.#buffer.isUp()) {return;}
        this.#view.arrowUp(this.#buffer.outputCursor());
        this.#view.updateCursor(this.#buffer.arrowUp());
    }
    outputText(){
        return this.#buffer.outputText();
    }
    
}

class Buffer {
    #headBuffer = "";
    #cursor = "";
    #bottomBuffer = "";
    constructor(){}
    init(text){
        let firstLineBottom = this.picFirstLine(text);
        this.#cursor = text.substring(0, firstLineBottom);
        this.#bottomBuffer = text.substring(firstLineBottom + 1);
        this.clearHeadLine(text);
    }
    outputCursor(){
        return this.#cursor;
    }
    outputText(){
        return this.#headBuffer + this.#cursor + this.#bottomBuffer;
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
        return "" != this.#headBuffer;
    }
    isDown(){
        return "" != this.#bottomBuffer;
    }
    clearHeadLine(){}
    clearBottomLine(){}
    arrowDown(){
        if (!this.isDown()) {return;}
        if (this.isUp) {
            this.#headBuffer += "\n";
        }
        this.#headBuffer += this.#cursor;
        let firstLineBottom = this.picFirstLine(this.#bottomBuffer);
        this.#cursor = this.#bottomBuffer.substring(0, firstLineBottom); 
        this.#bottomBuffer = this.#bottomBuffer.substring(firstLineBottom + 1);
        test.innerHTML = editor.outputText();
        return this.#cursor;
    }
    arrowUp(){
        if (!this.isUp()) {return;}
        this.#bottomBuffer = this.#cursor + "\n" + this.#bottomBuffer;
        let lastLineHead = this.picLastLine(this.#headBuffer);
        this.#cursor = this.#headBuffer.substring(lastLineHead);
        this.#headBuffer = this.#headBuffer.substring(0, lastLineHead - 1);
        return this.#cursor;
    }
}

class View {
    #headView;
    #cursorLineViewArea;
    #cursorLineNumberView;
    #cursorLineNumber;
    #cursorLineView;
    #bottomView;
    constructor(editor){
        this.#headView = document.createElement("div");
        this.#cursorLineViewArea = document.createElement("div");
        this.#cursorLineView = document.createElement("div");
        this.#cursorLineNumberView = document.createElement("div");
        this.#bottomView = document.createElement("div");
        editor.appendChild(this.#headView);
        editor.appendChild(this.#cursorLineViewArea);
        editor.appendChild(this.#bottomView);
        this.#cursorLineViewArea.appendChild(this.#cursorLineNumberView);
        this.#cursorLineViewArea.appendChild(this.#cursorLineView);
        this.#cursorLineViewArea.style.display = "flex";
        this.#cursorLineViewArea.style.flexDirection = "row";
        this.#cursorLineNumberView.style.width = "30px";
        this.#headView.style.whiteSpace = "pre-line";
        this.#bottomView.style.whiteSpace = "pre-line";
        this.#headView.style.width = "100%";
        this.#cursorLineView.style.width = "100%";
        this.#bottomView.style.width = "100%";
        this.#headView.style.border= "2px solid #ff0000";
        this.#cursorLineView.style.border= "2px solid #ffff00";
        this.#bottomView.style.border= "2px solid #00ff00";
        this.#cursorLineNumber = 1;
        this.#cursorLineNumberView.innerText = this.#cursorLineNumber;
    }
    init(text){
        let firstLineBottom = this.picFirstLine(text);

        this.#cursorLineView.innerText = text.substring(0, firstLineBottom);
        this.#bottomView.innerHTML = this.initInterprit(text.substring(firstLineBottom + 1));
    }
    initInterprit(text){
        return text;
    }
    interpritHead(headText){
        return headText;
    }
    interpritBottom(bottomText){
        return bottomText;
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
let editor = editorInit();
editor.load_text(test_text);
let test = document.createElement("div");
document.getElementById("editor").appendChild(test);
test.style.whiteSpace = "pre-line";
test.innerText = editor.outputText();

document.addEventListener("keydown", function(event){
    if (event.key === 'ArrowDown') {
        editor.arrowDown();
    }
    if (event.key === 'ArrowUp') {
        editor.arrowUp();
    }
})
