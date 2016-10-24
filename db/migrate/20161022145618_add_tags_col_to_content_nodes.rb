class AddTagsColToContentNodes < ActiveRecord::Migration
  def change
    add_column :content_nodes, :tags, :string, array: true, default: []
  end
end
