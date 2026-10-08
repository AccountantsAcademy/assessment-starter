export function Edit() {
  return (
    <>
      <h1 className="text-xl font-medium mb-4">Create a new article</h1>
      <form className="flex flex-col gap-2">
        <input
          type="text"
          required
          placeholder="Title"
          className="border p-2"
        />
        <textarea placeholder="Content" className="border p-2" />
        <button type="submit" className="border p-2 bg-blue-500 text-white">
          Create
        </button>
      </form>
    </>
  )
}

export default Edit
