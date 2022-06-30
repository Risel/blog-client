import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";
import { useNavigate, Navigate, Link, useParams } from "react-router-dom";
import axios from "../../axios";
import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../redux/slices/authSlice";

export const AddPost = () => {
  const { _id } = useParams();
  const isAuth = useSelector(selectIsAuth);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const fileRef = useRef(null);

  const isEdit = Boolean(_id);

  const handleChangeFile = async (e) => {
    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      const { data } = await axios.post("/upload", formData);
      setImageUrl(data.url);
    } catch (err) {
      console.warn(err);
      alert("Ошибка при загрузке фото");
    }
  };

  const onClickRemoveImage = () => {
    setImageUrl("");
  };

  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const fields = {
        title,
        imageUrl,
        tags,
        text,
      };

      const { data } = isEdit
        ? await axios.patch(`/posts/${_id}`, fields)
        : await axios.post("/posts", fields);
      const isId = isEdit ? _id : data._id;

      navigate(`/posts/${isId}`);
    } catch (err) {
      console.warn(err);
      alert("Ошибка при создании статьи");
    }
  };

  useEffect(() => {
    if (_id) {
      axios
        .get(`/posts/${_id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setText(data.text);
          setImageUrl(data.imageUrl);
          setTags(data.tags.join(","));
        })
        .catch((err) => {
          console.warn(err);
          alert("Ошибка при получении статьи!");
        });
    }
  }, []);

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />;
  }
  return (
    <Paper style={{ padding: 30 }}>
      <Button
        onClick={() => fileRef.current.click()}
        variant="outlined"
        size="large"
      >
        Загрузить превью
      </Button>
      <input ref={fileRef} onChange={handleChangeFile} type="file" hidden />
      {imageUrl && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onClickRemoveImage}
          >
            Удалить
          </Button>
          <img
            className={styles.image}
            src={`http://localhost:4444${imageUrl}`}
            alt="Uploaded"
          />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Тэги"
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {isEdit ? "Сохранить изменения" : "Опубликовать"}
        </Button>
        <Link to="/">
          <Button size="large">Отмена</Button>
        </Link>
      </div>
    </Paper>
  );
};
