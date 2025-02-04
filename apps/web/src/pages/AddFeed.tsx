import { Fragment } from "react";
import { Field, Formik } from "formik";
import { FeedSchema } from "@virginia/server";
import { toFormikValidate } from "zod-formik-adapter";
import { rpc } from "../rpc";
import AddCategoryForm from "../components/AddCategoryForm";

const Schema = FeedSchema.omit({ id: true });

export default function AddFeedPage() {
  const addFeed = rpc.addFeed.useMutation();
  const categories = rpc.categories.useQuery();
  const utils = rpc.useUtils();

  return (
    <main>
      <h1 className="font-bold text-xl mb-2">Add a category</h1>
      <Formik
        initialValues={{ url: "", categoryIds: [] as string[] }}
        validate={toFormikValidate(Schema)}
        onSubmit={async (values, { resetForm }) => {
          await addFeed.mutateAsync(values);
          await utils.feeds.invalidate();

          resetForm();
        }}
      >
        {({ errors, touched, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold" htmlFor="url">
                URL
              </label>

              <Field className="v-input" id="url" type="text" name="url" />

              {touched.url && errors.url}
            </div>

            <div>
              <label className="block text-sm font-bold">Categories</label>

              {/* TODO: aria-labelled-by */}
              {categories.data?.map((category) => (
                <Fragment>
                  <label htmlFor={category.id} title={category.name}>
                    {category.icon}
                  </label>

                  <Field
                    id={category.id}
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                  />
                </Fragment>
              ))}
              {touched.categoryIds && errors.categoryIds}
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

      <div className="outline-4 outline-red-500 ml-24">
        <AddCategoryForm />
      </div>
    </main>
  );
}
