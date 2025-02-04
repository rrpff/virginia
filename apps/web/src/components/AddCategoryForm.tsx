import { Formik } from "formik";
import { toFormikValidate } from "zod-formik-adapter";
import { rpc } from "../rpc";
import { CategorySchema } from "@virginia/server";

const Schema = CategorySchema.omit({ id: true });

export default function AddCategoryForm() {
  const utils = rpc.useUtils();
  const addCategory = rpc.addCategory.useMutation();

  return (
    <Formik
      initialValues={{ name: "", icon: "" }}
      validate={toFormikValidate(Schema)}
      onSubmit={async (values, { resetForm }) => {
        await addCategory.mutateAsync(values);
        await utils.categories.invalidate();

        resetForm();
      }}
    >
      {({
        values,
        errors,
        touched,
        handleSubmit,
        handleChange,
        handleBlur,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="v-input"
              placeholder="friends"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.name}
            />
            {touched.name && errors.name}
          </div>
          <div>
            <label className="block text-sm font-bold" htmlFor="icon">
              Icon
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              className="v-input"
              placeholder="🌈"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.icon}
            />
            {touched.icon && errors.icon}
          </div>
          <div>
            <button
              type="submit"
              className="v-button px-8!"
              disabled={isSubmitting}
            >
              Add
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}
