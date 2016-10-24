class CreateTimelines < ActiveRecord::Migration
  def change
    create_table :timelines do |t|
      t.string :title

      t.timestamps null: false
    end
  end
end
