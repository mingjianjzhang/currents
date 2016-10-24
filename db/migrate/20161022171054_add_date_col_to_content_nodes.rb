class AddDateColToContentNodes < ActiveRecord::Migration
  def change
    add_column :content_nodes, :day, :date
  end
end
