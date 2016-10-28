class ChangeColumnDefaultImageId < ActiveRecord::Migration
  def change
  	change_column_default :content_nodes, :image_id, 8 
  end
end
