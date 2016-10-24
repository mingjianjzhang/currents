class RemoveSourceColFromContentNodes < ActiveRecord::Migration
  def change
  	remove_column :content_nodes, :source, :string
  end
end
