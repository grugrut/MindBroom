import { useEffect, useRef } from 'react';
import MindElixir from 'mind-elixir';
import "mind-elixir/style";

export default function MindMap() {
    const containerRef = useRef(null);
    const mindRef= useRef(null);

    useEffect(() => {
	const instance = new MindElixir({
	    el: "#map",
	    direction: MindElixir.RIGHT,
	    draggable: true,
	    contextMenu: true,
	    toolbar: true,
	    nodeMenu: true,
	    keypress: true,
	    locale: "ja",
	});
	instance.init(MindElixir.new('root'));
	mindRef.current = instance;

	const handleResize = () => {
	    if (mindRef.current) {
		mindRef.current.resize();
	    }
	};
	window.addEventListener("resize", handleResize);
	setTimeout(handleResize, 100);

	return () => {
	    window.removeEventListener("resize", handleResize);
	};
	
    }, []);

    useEffect(() => {
	if (window.electronAPI) {
	    window.electronAPI.on("menu-save", handleSave);
	    window.electronAPI.on("menu-open", handleOpen);

	    return () => {
		window.electronAPI.removeAllListeners?.("menu-save");
		window.electronAPI.removeAllListeners?.("menu-open");
	    }
	} else {
	    console.warn("electronAPI is not available");
	}
    }, []);

    const handleSave = async () => {
	const data = mindRef.current.getData();
	await window.electronAPI.saveFile(data);
    };

    const handleOpen = async () => {
	const data = await window.electronAPI.openFile();
	if (data) {
	    mindRef.current.refresh(data);
	}
    };

    return (
	<div id="map" style={{ height: "100vh", width: "100%", backgroundColor: "#f3f4f6" }}>
	    <div style={{ textAlign: "center", padding: "10px" }}>
		<button onClick={handleSave} style={{ marginRight: "10px" }}>
		    Save Mind Map
		</button>
		<button onClick={handleOpen}>
		    Open Mind Map
		</button>
	    </div>
	    <div ref={containerRef} style={{ height: "90%" }}></div>
	</div>
    );
}
