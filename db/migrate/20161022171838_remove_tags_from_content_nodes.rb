class RemoveTagsFromContentNodes < ActiveRecord::Migration
  def change
    remove_column :content_nodes, :tags, :string
  end
end
