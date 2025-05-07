const test_text = '# fandation of podman"\n"リポジトリからコンテナをプルし、実行。\nリポジトリやsystemdからコンテナの自動起動と管理を行える。\n<img width="300px" src="./materials/podman-pod-image.png"><br>\n\n## related software\n- Buildah: ゼロから、あるいはイメージからコンテナを構築\n- Skepeo: 様々な環境間でのコンテナイメージのコピー\n- runC: OCIランタイム。イメージのビルドと実行、Docker形式のイメージの実行\n- CRI-O: Kubernetesとの連携\n\n## podman with cubernetes\npodmanではkubernetesYAMLの読み込みや、実行中のpodからの書き出しに対応している。\n読み込み: `podman kube play "pod.yaml"`\n書き出し: `podman generate kube -f path target_pod`\n\n# installation\n[about installation](https://github.com/containers/podman/blob/main/docs/tutorials/podman-for-windows.md)\n`podman machine init`\n\n# operate podman\nstart podman: `podman machine start`\nstop podman: `podman machine stop`\nchange to rootful: `podman machine set --rootful`\nchange to rootless: `podman machine set --rootless`(たぶん)\nlist podman machine(s): `podman machine ls`\n`podman system connection list`\nremove a machine: `podman machine rm "Option<machine_name>"`\n\n## container\nstart container: `podman run --name "container_name" "image_name"`\nstop container: `podman stop "container_name"`\nremove container: `podman rm "container_name"`\nlist running container: `podman ps`\nlist any containers: `podman ps -a`\n## image\npull image: `podman pull "image_name"`\nremove image: `podman rmi "image_id"`\nlist images: `podman images`\n## pod\nmake new pod: `podman pod create -p 8080:80 --name "pod_name"`\n### start pod:\n`podman run "pod_name"`\nport_forwarding: `podman run --rm -d -p 8080:80 "pod_name"`\nvolume_mounting: `podman run --rm -v PATH_on_windows:targetPATH_on_pod`\nstop pod: `podman pod stop "pod_name"`\nremove pod: `podman pod rm "pod_name"`\npod一覧表示: `podman pod ls`\n`podman pod ps`\nshow pod state: `podman pod top "pod_name"`\nshow pod state in detail: `podman pod inspect "pod_name"`\n## manage container in pod\nstart container: `podman run -dt --pod "pod_name" --name "container_name" "image_name"`\n# macvlan: podman netwark\n';

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
    
}

class Buffer {
    #headBuffer;
    #cursor;
    #bottomBuffer;
    constructor(){}
    init(text){
        this.#cursor = this.picFirstLine(text);
        this.#bottomBuffer = text;
        this.clearHeadLine(text);
    }
    outputText(){
        return this.#headBuffer + this.#cursor + this.#bottomBuffer;
    }
    picFirstLine(text){}
    clearHeadLine(){}
    clearBottomLine(){}
}

class View {
    #headView;
    #cursorLineView;
    #bottomView;
    constructor(editor){
        this.#headView = document.createElement("div");
        this.#cursorLineView = document.createElement("div");
        this.#bottomView = document.createElement("div");
        editor.appendChild(this.#headView);
        editor.appendChild(this.#cursorLineView);
        editor.appendChild(this.#bottomView);
        this.#headView.style.whiteSpace = "pre-line";
        this.#bottomView.style.whiteSpace = "pre-line";
    }
    init(text){
        this.#cursorLineView = this.picFirstLine(text);
        this.#bottomView = this.clearHeadLine(this.initInterprit(text));
    }
    initInterprit(text){}
    interpritLine(line){}
    picFirstLine(text){}
    clearHeadLine(text){}
    clearBottomLine(text){}
}

function editorInit(){
    return new Editor(document.getElementById("editor"));
}
let editor = editorInit();
editor.load_text(test_text);
