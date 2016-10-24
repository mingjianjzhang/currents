class AddSrcColToContentNode < ActiveRecord::Migration
  def change
    add_column :content_nodes, :source, :string
  end
end
