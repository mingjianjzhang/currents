class CreateContentTags < ActiveRecord::Migration
  def change
    create_table :content_tags do |t|
      t.references :content_node, index: true
      t.references :tag, index: true

      t.timestamps null: false
    end
    add_foreign_key :content_tags, :content_nodes
    add_foreign_key :content_tags, :tags
  end
end
