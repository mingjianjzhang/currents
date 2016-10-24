class AddTagIndexToContentNode < ActiveRecord::Migration
  def change
  	add_index :content_nodes, :tags, using: 'gin'
  end
end
