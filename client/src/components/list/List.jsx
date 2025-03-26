import "./list.scss";
import Card from "../card/Card";

function List({ posts, editable }) {
  return (
    <div className="list">
      {posts.map((item) => (
        <Card key={item.id} item={item} editable={editable} />
      ))}
    </div>
  );
}

export default List;
