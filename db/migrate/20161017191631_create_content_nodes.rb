class CreateContentNodes < ActiveRecord::Migration
  def change
    create_table :content_nodes do |t|
      t.string :title
      t.string :link
      t.text :description
      t.references :category, index: true

      t.timestamps null: false
    end
    add_foreign_key :content_nodes, :categories
  end
end
