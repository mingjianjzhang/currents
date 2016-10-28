class ChangeSourceCalNameImages < ActiveRecord::Migration
  def change
	rename_column :images, :source, :img_source
  end
end
