import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import './editor.css';
import 'react-quill/dist/quill.snow.css';
import Popup from 'reactjs-popup';

const Editor = () => {
  const [editorHtml, setEditorHtml] = useState('');
  const [length, setLength] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const quillRef = React.useRef();
  const inputRef = useRef(null);

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    const updateLength = () => {
      setLength(quill.getLength());
    };

    quill.on('text-change', updateLength);

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => {
      quill.off('text-change', updateLength);
      clearInterval(interval);
    };
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    const elem = document.documentElement;
    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  };

  const handleChange = (html) => {
    setEditorHtml(html);
  };

  const handleClear = () => {
    const quill = quillRef.current.getEditor();
    quill.setContents('');
  };

  const countWords = (content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();

    const words = text.split(/\s+/);

    const filteredWords = words.filter((word) => word !== '');

    return filteredWords.length;
  };

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['link', 'image', 'video'],
      [{ direction: 'rtl' }],
      ['clean'],
    ],
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleReplaceTextChange = (e) => {
    setReplaceText(e.target.value);
  };

  const findAndReplace = () => {
    const quill = quillRef.current.getEditor();
    const editor = quill.root;
    const rSearchQuery = ' ' + searchQuery;
    const searchText = new RegExp(rSearchQuery, 'g');
    const editorHtml = editor.innerHTML;
    const rReplaceText = ' ' + replaceText;
    const replacedHtml = editorHtml.replace(searchText, rReplaceText);
    editor.innerHTML = replacedHtml;
  };

  const handleUndo = () => {
    const quill = quillRef.current.getEditor();
    quill.history.undo();
  };

  const handleRedo = () => {
    const quill = quillRef.current.getEditor();
    quill.history.redo();
  };

  const handleFileOpen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditorHtml(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  const handleSave = (format) => {
    const quill = quillRef.current.getEditor();
    let text;
    let extension;

    switch (format) {
      case 'txt':
        text = quill.getText();
        extension = 'txt';
        break;
      case 'html':
        text = quill.root.innerHTML;
        extension = 'html';
        break;
      case 'json':
        text = JSON.stringify({ content: quill.getText() }, null, 2);
        extension = 'json';
        break;

      default:
        text = quill.getText();
        extension = 'txt';
    }

    if (extension) {
      const blob = new Blob([text], { type: `text/${extension}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${extension}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const createNew = () => {
    location.reload();
  };

  const resetTimer = () => {
    setTimer(0);
  };

  const onFRClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const selectEditor = () => {
    const quill = quillRef.current.getEditor();
    quill.setSelection(0, quill.getLength());
  };

  return (
    <div>
      <div className="navbar">
        <div className="dropdown">
          <button className="dropbtn">
            File<i className="fa fa-caret-down"></i>
          </button>
          <div className="dropdown-content">
            <div className="dropdown-content">
              <Popup trigger={<a>New</a>} modal>
                {(close) => (
                  <div className="modal">
                    <button className="close">&times;</button>
                    <div className="header">Are you sure?</div>
                    <div className="content">
                      <h2>Are you sure you want to discard this file?</h2>
                      <button onClick={createNew} className="mdlBtn">
                        Yes
                      </button>
                      <button onClick={close} className="mdlBtn">
                        No
                      </button>
                    </div>
                  </div>
                )}
              </Popup>
              <Popup trigger={<a>Open File</a>} modal nested>
                {(close) => (
                  <div className="modal">
                    <button className="close" onClick={close}>
                      &times;
                    </button>
                    <div className="header"> Save file </div>
                    <div className="content">
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileOpen}
                      />
                    </div>
                  </div>
                )}
              </Popup>
              <a onClick={() => handleSave('txt')}>Save</a>
              <Popup trigger={<a>Save as</a>} modal>
                {(close) => (
                  <div className="modal">
                    <button className="close" onClick={close}>
                      &times;
                    </button>
                    <div className="header" style={{ fontSize: '1.5rem' }}>
                      {' '}
                      Save your file in the following formats:
                    </div>
                    <div className="content">
                      <a
                        onClick={() => handleSave('txt')}
                        className="saveAsBtn"
                      >
                        Save as TXT
                      </a>
                      <a
                        onClick={() => handleSave('html')}
                        className="saveAsBtn"
                      >
                        Save as HTML
                      </a>
                      <a
                        onClick={() => handleSave('json')}
                        className="saveAsBtn"
                      >
                        Save as JSON
                      </a>{' '}
                    </div>
                  </div>
                )}
              </Popup>
            </div>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">
            Edit<i className="fa fa-caret-down"></i>
          </button>
          <div className="dropdown-content">
            <a onClick={handleUndo}>Undo</a>
            <a onClick={handleRedo}>Redo</a>
            <a href="#"></a>
            <a onClick={handleClear}>Clear Document</a>
            <a onClick={onFRClick}>Find and Replace</a>
            <a onClick={selectEditor}>Select All Text</a>
          </div>
        </div>{' '}
        <div className="dropdown">
          <button className="dropbtn">View</button>
          <div className="dropdown-content">
            <a onClick={toggleFullScreen}>Go Fullscreen</a>
            <a onClick={resetTimer}>Reset Time Worked</a>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">
            About<i className="fa fa-caret-down"></i>
          </button>
          <div className="dropdown-content">
            <Popup trigger={<a>About</a>} modal>
              {(close) => (
                <div className="modal">
                  <button className="close" onClick={close}>
                    &times;
                  </button>
                  <h1 className="header">About</h1>
                  <div className="content">
                    <p>
                      This rich text editor was made with React, Quill.js, and a
                      lot of patience by Amey. Visit my website{' '}
                      <a href="https://ameyvijeesh.netlify.app">here</a>.
                    </p>
                  </div>
                </div>
              )}
            </Popup>
          </div>
        </div>
      </div>
      <div className="toolbar2">
        <div className="ctrCont">
          <button onClick={selectEditor} className="topBtn">
            Select
          </button>
          <button onClick={handleClear} className="topBtn">
            Clear
          </button>
        </div>
        <div className="find-replace">
          <input
            type="text"
            placeholder="Search text"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            ref={inputRef}
            className="find-replaceInput"
          />
          <input
            type="text"
            placeholder="Replace with"
            value={replaceText}
            onChange={handleReplaceTextChange}
            className="find-replaceInput"
          />
          <button onClick={findAndReplace} className="find-replaceBtn">
            Find & Replace
          </button>
        </div>
        <div className="ctrCont">
          <button onClick={handleUndo} className="topBtn">
            Undo
          </button>
          <button onClick={handleRedo} className="topBtn">
            Redo
          </button>
        </div>
      </div>
      <div className="editor-container">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorHtml}
          onChange={handleChange}
          modules={modules}
          placeholder="Your text here..."
          className="editor-container"
        />{' '}
      </div>
      <br /> <br /> <br />
      <div className="toolbar">
        <p className="menuInfo">Time Working: {formatTime(timer)}</p>
        <p className="menuInfo">Characters: {length}</p>
        <p className="menuInfo">Total Words: {countWords(editorHtml)}</p>{' '}
      </div>
    </div>
  );
};

export default Editor;
